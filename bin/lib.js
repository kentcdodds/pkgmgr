const SUPPORTED = new Set(['npm', 'pnpm', 'yarn', 'bun'])

// Maps package manager to its "exec" command equivalent
const EXEC_COMMANDS = {
  npm: { bin: 'npx', args: [] },
  pnpm: { bin: 'pnpm', args: ['dlx'] },
  yarn: { bin: 'yarn', args: ['dlx'] },
  bun: { bin: 'bunx', args: [] },
}

export function detectPackageManager(fallback = 'npm') {
  // 1. Explicit override via environment variable
  const envOverride = process.env.PKGMGR
  if (envOverride && SUPPORTED.has(envOverride)) {
    return envOverride
  }

  // 2. Infer from npm_config_user_agent (set by package managers when running scripts)
  // Format: "npm/10.2.0 node/v20.10.0 darwin arm64"
  const userAgent = process.env.npm_config_user_agent
  if (userAgent) {
    const firstToken = userAgent.split(' ')[0] // e.g. "npm/10.2.0"
    const name = firstToken?.split('/')[0]
    if (name && SUPPORTED.has(name)) {
      return name
    }
  }

  // 3. Fall back to specified default
  return fallback
}

export async function run(fallback = 'npm') {
  const pm = detectPackageManager(fallback)
  const args = process.argv.slice(2)

  const { spawn } = await import('node:child_process')

  const child = spawn(pm, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  child.on('error', (err) => {
    console.error(`pkgmgr: failed to execute ${pm}: ${err.message}`)
    process.exit(1)
  })

  child.on('close', (code) => {
    process.exit(code ?? 0)
  })
}

export async function runExec(fallback = 'npm') {
  const pm = detectPackageManager(fallback)
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('pkgmgrx: no command specified')
    process.exit(1)
  }

  const { bin, args: prefixArgs } = EXEC_COMMANDS[pm]
  const command = [...prefixArgs, ...args]

  const { spawn } = await import('node:child_process')

  const child = spawn(bin, command, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  child.on('error', (err) => {
    console.error(`pkgmgrx: failed to execute ${bin}: ${err.message}`)
    process.exit(1)
  })

  child.on('close', (code) => {
    process.exit(code ?? 0)
  })
}

import { test } from 'node:test'
import assert from 'node:assert'
import { detectPackageManager } from './lib.js'

function setupEnv(overrides = {}) {
  const original = { ...process.env }

  delete process.env.PKGMGR
  delete process.env.npm_config_user_agent

  Object.assign(process.env, overrides)

  return {
    [Symbol.dispose]() {
      process.env = original
    },
  }
}

// PKGMGR environment variable

test('uses PKGMGR=npm when set', () => {
  using _env = setupEnv({ PKGMGR: 'npm' })
  assert.strictEqual(detectPackageManager(), 'npm')
})

test('uses PKGMGR=pnpm when set', () => {
  using _env = setupEnv({ PKGMGR: 'pnpm' })
  assert.strictEqual(detectPackageManager(), 'pnpm')
})

test('uses PKGMGR=yarn when set', () => {
  using _env = setupEnv({ PKGMGR: 'yarn' })
  assert.strictEqual(detectPackageManager(), 'yarn')
})

test('uses PKGMGR=bun when set', () => {
  using _env = setupEnv({ PKGMGR: 'bun' })
  assert.strictEqual(detectPackageManager(), 'bun')
})

test('ignores unsupported PKGMGR value and falls back to npm', () => {
  using _env = setupEnv({ PKGMGR: 'unsupported' })
  assert.strictEqual(detectPackageManager(), 'npm')
})

test('PKGMGR takes priority over npm_config_user_agent', () => {
  using _env = setupEnv({
    PKGMGR: 'yarn',
    npm_config_user_agent: 'pnpm/8.0.0 node/v20.0.0',
  })
  assert.strictEqual(detectPackageManager(), 'yarn')
})

// npm_config_user_agent detection

test('detects npm from user agent', () => {
  using _env = setupEnv({
    npm_config_user_agent: 'npm/10.2.0 node/v20.10.0 darwin arm64',
  })
  assert.strictEqual(detectPackageManager(), 'npm')
})

test('detects pnpm from user agent', () => {
  using _env = setupEnv({
    npm_config_user_agent: 'pnpm/8.15.0 npm/? node/v20.10.0',
  })
  assert.strictEqual(detectPackageManager(), 'pnpm')
})

test('detects yarn from user agent', () => {
  using _env = setupEnv({
    npm_config_user_agent: 'yarn/4.0.0 npm/? node/v20.10.0',
  })
  assert.strictEqual(detectPackageManager(), 'yarn')
})

test('detects bun from user agent', () => {
  using _env = setupEnv({ npm_config_user_agent: 'bun/1.0.0 node/v20.10.0' })
  assert.strictEqual(detectPackageManager(), 'bun')
})

test('falls back when user agent has unsupported package manager', () => {
  using _env = setupEnv({ npm_config_user_agent: 'unknown/1.0.0 node/v20.0.0' })
  assert.strictEqual(detectPackageManager(), 'npm')
})

test('falls back when user agent is malformed', () => {
  using _env = setupEnv({ npm_config_user_agent: 'malformed-string' })
  assert.strictEqual(detectPackageManager(), 'npm')
})

test('falls back when user agent is empty', () => {
  using _env = setupEnv({ npm_config_user_agent: '' })
  assert.strictEqual(detectPackageManager(), 'npm')
})

// Fallback behavior

test('uses npm as default fallback when no env is set', () => {
  using _env = setupEnv()
  assert.strictEqual(detectPackageManager(), 'npm')
})

test('uses pnpm fallback when specified and no env is set', () => {
  using _env = setupEnv()
  assert.strictEqual(detectPackageManager('pnpm'), 'pnpm')
})

test('uses bun fallback when specified and no env is set', () => {
  using _env = setupEnv()
  assert.strictEqual(detectPackageManager('bun'), 'bun')
})

test('uses yarn fallback when specified and no env is set', () => {
  using _env = setupEnv()
  assert.strictEqual(detectPackageManager('yarn'), 'yarn')
})

test('custom fallback is ignored when PKGMGR is set', () => {
  using _env = setupEnv({ PKGMGR: 'npm' })
  assert.strictEqual(detectPackageManager('pnpm'), 'npm')
})

test('custom fallback is ignored when user agent is present', () => {
  using _env = setupEnv({ npm_config_user_agent: 'yarn/4.0.0 node/v20.0.0' })
  assert.strictEqual(detectPackageManager('pnpm'), 'yarn')
})

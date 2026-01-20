# pkgmgr

A minimal CLI that forwards commands to whichever package manager you're already using.

![Diff showing package.json scripts being updated to use pkgmgr instead of npm. Scripts like "postinstall", "start", "dev", "build", and "test" are changed from using "npm" and "npx" to "pkgmgr" and "pkgmgrx". The result: these scripts now work seamlessly whether contributors use npm, pnpm, yarn, or bun.](./demo.png)

**What's happening here:** A project replaces hardcoded `npm` and `npx` calls with `pkgmgr` and `pkgmgrx` in their package.json scripts. Now when a contributor runs `pnpm run dev`, the script uses `pnpm`. When another runs `bun run dev`, it uses `bun`. No configuration, no conditional logic—just automatic package manager detection.

## The Problem

You're writing a script, a tool, or documentation that needs to run package manager commands. But different users use different package managers (npm, pnpm, yarn, bun), and you don't want to:

- Hardcode a specific package manager
- Ask users to modify your script
- Set up complex workspace configurations

## What pkgmgr Does

pkgmgr detects which package manager invoked the current process and forwards your command to it verbatim. It's a best-effort user-intent propagation tool.

```bash
pkgmgr install          # runs: <detected-pm> install
pkgmgr add react        # runs: <detected-pm> add react
pkgmgr remove lodash    # runs: <detected-pm> remove lodash
pkgmgr run build        # runs: <detected-pm> run build
pkgmgr exec vitest      # runs: <detected-pm> exec vitest
```

## Available Binaries

### Package Manager Binaries (`pkgmgr`)

Forward commands directly to the detected package manager.

| Binary | Fallback |
|--------|----------|
| `pkgmgr` | npm |
| `pkgmgr-bun` | bun |
| `pkgmgr-pnpm` | pnpm |
| `pkgmgr-yarn` | yarn |

### Exec Binaries (`pkgmgrx`)

Forward commands to the detected package manager's "exec" equivalent.

| Binary | Fallback | Executes |
|--------|----------|----------|
| `pkgmgrx` | npm | `npx <args>` |
| `pkgmgrx-bun` | bun | `bunx <args>` |
| `pkgmgrx-pnpm` | pnpm | `pnpm dlx <args>` |
| `pkgmgrx-yarn` | yarn | `yarn dlx <args>` |

```bash
pkgmgrx cowsay "Hello"    # runs: npx cowsay "Hello" (or bunx, pnpm dlx, yarn dlx)
pkgmgrx tsc --version     # runs: npx tsc --version
```

All binaries use the same detection logic. The only difference is which package manager is used when detection fails (no `PKGMGR` env var and no `npm_config_user_agent`).

## Detection Logic

pkgmgr determines which package manager to use in this order:

1. **`PKGMGR` environment variable** — If set to a supported value, use it
2. **`npm_config_user_agent`** — Parse the first token (e.g., `pnpm/8.0.0` → `pnpm`)
3. **Fallback** — Use `npm`

This is heuristic detection, not verification. pkgmgr trusts the environment.

## Supported Package Managers

- npm
- pnpm
- yarn
- bun

## Overriding Detection

Set the `PKGMGR` environment variable to force a specific package manager:

```bash
PKGMGR=pnpm pkgmgr add zod
```

## Usage Examples

```bash
# Install dependencies (default command if no args)
pkgmgr

# Add a package
pkgmgr add express

# Remove a package
pkgmgr remove lodash

# Run a script
pkgmgr run test

# Run with arguments
pkgmgr run build -- --watch

# Execute a binary
pkgmgr exec tsc --version

# Override detection
PKGMGR=yarn pkgmgr add react
```

## When to Use This

**Good fit:**

- Scripts that should work regardless of user's package manager choice
- Documentation that doesn't want to prescribe a specific tool
- Tools that need to install dependencies as part of setup

**Not a good fit:**

- CI pipelines where you control the environment (just use your package manager directly)
- Situations requiring specific package manager features
- Contexts where command translation between package managers is needed

## Known Limitations

- **No command translation** — `pkgmgr add` is passed verbatim; if you're using npm, you may need `pkgmgr install` instead. This tool does not normalize commands between package managers.
- **Corepack** — pkgmgr does not interact with Corepack. If Corepack intercepts your package manager, that's between you and Corepack.
- **CI environments** — Detection relies on `npm_config_user_agent`, which may not be set in all CI contexts. Use `PKGMGR` explicitly if needed.
- **Wrapper scripts** — If your package manager is wrapped or aliased, detection may not work as expected.
- **Nested installs** — If you're running pkgmgr from within another package manager's lifecycle script, detection reflects the outer package manager.
- **No lockfile inspection** — pkgmgr does not look at lockfiles to determine package manager. It trusts the runtime environment only.

## Why Not npx?

Running `npx pkgmgr add react` defeats the purpose. npx is part of npm, so it sets `npm_config_user_agent` to npm. pkgmgr would detect npm and run `npm add react`—regardless of what package manager you actually use.

The same applies to other package runners:
- `npx pkgmgr ...` → detects npm
- `pnpm dlx pkgmgr ...` → detects pnpm  
- `yarn dlx pkgmgr ...` → detects yarn
- `bunx pkgmgr ...` → detects bun

pkgmgr is meant to be **installed as a dependency** in your project. When users run your scripts through their package manager (e.g., `pnpm run setup`), pkgmgr detects the invoking package manager from within that context.

## Installation

```bash
npm install pkgmgr
# or
pnpm add pkgmgr
# or
yarn add pkgmgr
# or
bun add pkgmgr
```

## License

MIT

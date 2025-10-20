# Copilot instructions for Chai — Universal Package Manager

Author: Steve Alappat (theatom06) (used: ChatGPT, copilot), Date: 20 OCT 2025

This file gives concise, repository-specific guidance for AI coding agents to be productive quickly. Keep edits short and factual. Reference the files below when making changes.

1. Project summary
   - Chai is a cross-platform, modular package manager for Node/Bun, Python, and system packages and of course chai itself.
   - CLI entry: `code/index.ts` (uses `commander`).
   - Packages are expected to be stored under a user (conceptually `~/.chai`). They are divided by language/runtime and registry (e.g. `~/.chai/npm`, `~/.chai/python`, `~/.chai/system`).
   - The whole project is made in Bun.js Typescript

2. High-level architecture (what to edit/avoid)
   - `code/commands/*` contains discrete command handlers (install, remove, update, upgrade, list, sip, info, publish, init, etc.). Each command should remain focused: receive args, validate, call core APIs to perform actions, and return the data to caller for output formatting (as it can be both CLI, or TUI, or app). make it modular and export uniform interfaces so that more can be added later.
   - `code/core/*` houses core implementation logic and integrations:
     - `code/core/registry/*` contains per-registry adapters (npm, github, python, system, chai). Use these adapters for index/search/fetch operations. Each adapter should implement a common interface for ease of extension.
     - `code/core/package/*` contains package manifest, resolution and linking logic. Keep CLI-specific formatting in `code/commands/*` and functional logic in `core/package`.
     - `code/core/cache/*` controls local caching; commands that change state should call `core/cache/clean.ts` when appropriate.
   - `code/lib/semver/*` provides in-repo semver utilities (parse, compare, sort, inc, satisfies). Prefer these for version logic to avoid adding external semver libraries.
   - `code/lib/logger.js` (if exists) or create one to standardize logging output across commands and core modules.
   - All errors are to be thrown as exceptions with clear messages. Command handlers should catch and format them for user output. No error to crash silently. use `try/catch` blocks in commands.
   - maintain configuration and defaults ``/.chai/config.json`.

3. Developer workflows & commands
   - The project is TypeScript-first but uses `type: module` and a `module` entry in `package.json` pointing to `code/index.ts`. Typical local dev flow (no build tools configured):
     - Run small scripts or `ts-node`/Deno/Bun if available locally. There is no explicit build or test config in repo; add minimal scripts in `package.json` only if necessary.
   - Editing patterns:
     - Keep public function signatures stable in `core/*` adapters. Changes to these require updating command callers in `code/commands/*`.
     - CLI behavior (flags, help text) should be defined in `code/index.ts` and per-command modules.
   - Make a file for global types if needed: `code/types/global.d.ts`.
   - Let chai have shell autocompletion scripts for bash/zsh/fish/powershell in `scripts/` if needed and for chai commands via `commander` capabilities.

4. Coding style & naming (Gandalf's JavaScript Naming Scheme)
   - CamelCase for variables and functions: `myVariable`, `myFunction`.
   - PascalCase for classes, constructors and module names: `MyClass`, `MyModule`.
   - ALL_CAPS for constants with underscores: `MY_CONSTANT`.
   - Prefix booleans with `is` (or `has` for presence checks): `isActive`, `hasItems`.
   - Suffix async functions with `Async`: `fetchDataAsync()`; use `Handler` for event handlers: `clickHandler`.
   - Use a single underscore prefix for internal/private variables: `_internalValue`.
   - Use plural nouns for arrays/collections: `users`, `items`.
   - Functions should be verbs describing the action: `calculateTotal`, `validateForm`.
   - Indentation: 2 spaces per block. All TypeScript/JS files in the repo should follow this spacing.

5. Documentation style (doc-in-comments)
   - Prefer doc-in-comments for all functions, modules and public APIs using JSDoc/TSDoc style.
   - Place a short description first, then `@param` / `@returns` / `@example` tags as needed.
   - Keep examples small and runnable. Reference real files when useful (e.g. `code/lib/semver/semver.js`).
   - Example:
     /\*\*
     _ Parses a version string and returns metadata about its components.
     _ @param {string} version - Semver string like '1.2.3-alpha+001'
     _ @returns {{major:number,minor:number,patch:number}} parsed parts
     _/
     function semver(version) { /_ ... _/ }

   - Use the doc comments to explain side-effects, filesystem paths (like `~/.chai`), and important invariants.

6. Project-specific conventions
   - Avoid adding heavy dependencies; this project prefers small, self-contained utilities (see `code/lib/semver/*`).
   - Files under `code/commands` are short command wrappers; complex logic belongs in `code/core`.
   - Use ESM exports (default and named) to match existing files.
   - Keep side-effects (file system writes, network calls) inside `core/*` and guard them so unit tests can mock adapters.

7. Integration points & external systems
   - Registries: network calls and package lookups should go through `code/core/registry/*` adapters. Examples:
     - `code/core/registry/npm.ts` — interacts with npm registry.
     - `code/core/registry/python.ts` — interacts with PyPI.
   - The `~/.chai` sandbox path is a global concept (not yet implemented in code). If adding code that reads/writes there, centralize path resolution in `core` (e.g., `core/config` or `core/fs`) so it can be changed later.

8. Semver utility specifics (examples you can reuse)
   - Use `code/lib/semver/semver.js` to parse versions. Example: `import semver from '../lib/semver/semver.js'` then call `semver('^1.2.0')`.
   - Use `satisfies`, `gt`, `lt`, `inc`, and `sort` from `code/lib/semver/*` to implement version checks and increments.

9. When changing command behavior
   - Update the command file in `code/commands` and add or update an adapter in `code/core` if you need new functionality.
   - Add clear, minimal tests or a reproducible script demonstrating behavior in a temporary folder. Prefer non-destructive defaults (dry-run flags) for dangerous operations.

10. Examples of quick edits

- Fixing version comparison bug: update `code/lib/semver/gt.js` and run a local node snippet importing that module to validate results.
- Adding a new `info` flag: edit `code/commands/info.ts` to parse the flag and call `code/core/package/manifest.ts`.

11. Safety & UX

- Commands that modify the sandbox must prompt or require `--yes`/`--force` for non-interactive scripts.
- Both sip and postinstall scripts must request permissions explicitly. Log permission requests and user responses.
- When implementing network retries, keep defaults small and respect user-configurable timeouts (place config in `core`).
- All logger levels, color codes must be consistent across commands. Use a central logging utility if available or create one in `code/lib/logger.js` to standardize output formatting. Store logs in `~/.chai/logs` with rotation.

12. Files to reference while coding

- CLI entry: `code/index.ts`
- Command handlers: `code/commands/*.ts`
- Core adapters: `code/core/registry/*.ts`, `code/core/package/*.ts`, `code/core/cache/*.ts`
- Semver helpers: `code/lib/semver/*.js`
- Package manifest: `package.json`

13. Command Explantion

- Install: Installs a package into ~/.chai/packages and links its executables to ~/.chai/bin. Accepts identifiers (gh:user/repo, npm:pkg, py:pkg, chai:pkg, sys:path) and --from <src> override. Workflow: resolve → if local avaliable use that else → fetch registry metadata → validate manifest.chai.json → verify semver and existing installs → extract into <name>@<version> → run postinstall (if defined, in sandboxed mode with minimal perms if it uses any perms ask the user) → symlink declared binaries. Respects caching (.chai/cache) and uses lib/semver to pick versions unless exact (if not mentions uses latest). Exit codes: 0 success, 1 network/fetch error, 2 manifest/validation error, 3 permission denied. Examples: chai install gh:steve/tool, chai install npm:express.

- Publish: Packages (only chai modules) a folder into a Chai-compatible tarball, signs it with the user key (if configured), and uploads metadata + tarball to the Chai registry. Flags: --private (do not publish to public index), --key <path> (explicit signing key). Steps: validate manifest.chai.json (name/version/type), run optional build script, compute SHA256, create index entry, push to server API, print URL + package hash. Failures: missing manifest, version already exists (non-forced), auth error. Example: chai publish ./dist --key ~/.chai/keys/id_rsa.

- Update: Updates a package to the highest compatible patch/minor version per semver constraints in its manifest or installed lock. Default behavior: if manifest uses ranges (^/~), pick highest matching version; with --minor or --patch limit the scope. Writes new version into packages, updates symlinks, and updates .chai/lock. Does not change major by default. Does not remove old version thats the function of clean .Example: chai update chalk or chai update lib --patch.

- Upgrade: Forces a major-version upgrade (X version bump) or upgrades to the next major available. Use when breaking changes are acceptable. Flags: --interactive (show changelog/diff and confirm). Workflow: resolve next major (using semver gt), backup current install, install new version, run health checks, rollback on failure. Exit codes indicate rollback if non-zero. Example: chai upgrade server --interactive.

- Remove: Removes an installed package (all versions by default, or a specific name@version). Flags: --unused removes packages that no other installed package declares as a dependency; --force bypasses prompts. Behavior: unlink binaries, remove package dir, update cache and lockfile. If --unused is used, it computes dependency graph and only deletes leaves. Example: chai remove chalk chai remove foo@1.0.0 chai remove --unused.

- Sip: Runs a package in a temporary sandbox without permanently installing it. You must explicitly grant permissions via --allow (comma list: fs,net,env,proc,sys) or if nothing is mentioned or other perms are needed it asks for it while running. Process: fetch into .chai/tmp/<hash>, validate manifest, spawn process inside sandbox runner that enforces permissions (restrict env, chroot-like working dir, network toggles where possible), stream logs to console, and auto-clean temp dir on exit. Good for trying CLIs or testing packages. Example: chai sip gh:steve/preview --allow net,fs. If an operation needs disallowed perms, it exits with code 4 and shows what permission was requested.

- List: Shows installed packages, versions, install dates, and status. Modifiers: --all (all versions), --upgradeable or --outdated (shows upgrades available using semver + registry query), --unused (lists candidates for removal). Output formats: human (default) and --json. Uses cache first and validates stale entries with registry on --outdated. Example: chai list --outdated chai list --json.

- Info: Displays detailed metadata about a package (local or remote): name, version(s) installed, latest available, type (node|bun|python|system), entrypoint(s), declared permissions, dependencies, source registry, checksums, and last-updated timestamps. Flags: --remote forces registry query; --json prints machine-readable info. Example: chai info gh:steve/tool chai info chalk --remote.

- Init: Bootstraps a new manifest.chai.json and package skeleton for the chosen type (--type node|bun|python|system). Options: --interactive (prompt for name/version/entry/permissions), --license, --author. Creates sensible defaults and a .chaiignore. Does NOT publish. Example: chai init --type bun --interactive.

- Doctor: Runs environment diagnostics — checks ~/.chai integrity, available disk space, node/bun/python runtimes, permissions for symlinks, and cache consistency. Returns a short actionable report and suggested fixes (e.g., "run chai clean" or "grant write access to ~/.chai"). Useful before big installs/upgrades.

- Clean: Cleans cache and temp files and unused packages. Flags: --cache (clear cache), --tmp (remove .chai/tmp), --all (garbage-collect unreferenced package files and old versions), --keep <n> (keep latest n versions). Does safe deletion: computes references and never removes packages still linked in bin or referenced in lockfile without explicit --force.

- Dashboard: (CLI helper to launch TUI later) Gathers data and starts the interactive dashboard (Ink) if available. In CLI-only mode it prints a compact summary: installed count, upgradeable count, disk usage. --open launches the TUI.

- Help: Auto-generated by Commander.js; shows command list, usage, flags, and examples. -h, --help shows global help; chai <command> --help shows command-specific help. Keep examples concise and copyable.

- Version: Prints the Chai CLI version and optional runtime info with --env (shows Bun/Node/Python versions). Useful for bug reports.

- Extra notes (behavioral/implementation constraints)

  -- Permissions: Every command that executes package code (install postinstall, sip, publish hooks) requires explicit permission gating. Log the requested permission and whether it was auto-granted or denied. Never run arbitrary postinstall without at least a prompt or config allowing it (~/.chai/config.json).

  -- Semver handling: All version resolution uses lib/semver (local copy). When resolving ranges, prefer highest satisfying version; when network is unavailable, respect cache and warn the user with a non-fatal status unless --strict is set.

  -- Symlinks and PATH: Binaries are symlinked into ~/.chai/bin. Provide a one-liner in doctor/help to add it to PATH. On Windows, create shim scripts if symlinks are unsupported.

  -- Safety: Always create backups before destructive ops (upgrade/remove) and support rollback on failure.

  -- Exit codes: Use specific codes for automation: 0 success, 1 generic error, 2 manifest/validation, 3 permission, 4 sandbox permission violation, 5 network, 6 conflict/lockfile.

  -- Machine output: Support --json on all user-facing commands to enable automation and CI usage.

14. Addtional notes:

-

# Jest Memory Leak Investigation Log

## Goal
- Investigate theory #1: `Onyx.clear()` does not disconnect existing Onyx subscriptions, causing persistent listeners from:
  - `OnyxUpdateManager()`
  - `initOnyxDerivedValues()`
  - module-level `Onyx.connect()` / `Onyx.connectWithoutView()` usage

## Constraints
- Avoid high-memory commands.
- Run only targeted tests for touched code.
- Keep per-theory commits for blacksmith.sh benchmarking.

## TODO
- [completed] Confirm whether `Onyx.clear()` disconnects listeners.
- [completed] Reduce repeated listener registration from `OnyxUpdateManager()` and `initOnyxDerivedValues()`.
- [completed] Run targeted Jest tests for affected files.
- [in_progress] Commit theory #1 fix.

## What I tried
- Searched repository for:
  - `Onyx.clear(`
  - `OnyxUpdateManager(`
  - `initOnyxDerivedValues(`
  - `Onyx.connect(`
- Inspected:
  - `jest/setup.ts`
  - `jest/setupAfterEnv.ts`
  - `jest.config.js`
  - `src/libs/actions/OnyxUpdateManager/index.ts`
  - `src/libs/actions/OnyxDerived/index.ts`
  - `node_modules/react-native-onyx/API.md`
  - `node_modules/react-native-onyx/dist/Onyx.js`
  - `node_modules/react-native-onyx/dist/OnyxConnectionManager.d.ts`
- Implemented:
  - Idempotent listener registration in `src/libs/actions/OnyxUpdateManager/index.ts` (single `ONYX_UPDATES_FROM_SERVER` connection).
  - Re-initialization guard in `src/libs/actions/OnyxDerived/index.ts` that disconnects previously registered derived listeners before re-registering.
  - Connection tracking in `src/libs/actions/OnyxDerived/index.ts` to avoid unbounded listener growth across repeated init calls.

## Findings
- `Onyx.clear()` calls `refreshSessionID()` but does **not** call `disconnectAll()`.
- `OnyxUpdateManager()` currently creates a new `Onyx.connectWithoutView()` listener every invocation.
- `initOnyxDerivedValues()` currently creates many `Onyx.connectWithoutView()` listeners every invocation.
- Many tests invoke these initializers repeatedly (module-level and/or setup hooks), so listeners can accumulate within long-running test files/workers.
- Lint for changed source files passes.

## Verification runs
- `npm_config_cache=/tmp/.npm npx jest --runInBand --watchman=false tests/actions/OnyxUpdateManagerTest.ts`
  - Result: PASS (3/3 tests).
- `npm_config_cache=/tmp/.npm npx jest --runInBand --watchman=false tests/unit/OnyxDerivedTest.tsx -t "returns empty object when dependencies are not set|returns empty reports when dependencies are not set"`
  - Result: 1 pass, 1 fail (`nonPersonalAndWorkspaceCardList` expected `{}`, received `null`).
- `npm_config_cache=/tmp/.npm npx eslint src/libs/actions/OnyxDerived/index.ts src/libs/actions/OnyxUpdateManager/index.ts`
  - Result: PASS.

## Theory #1 change to test
- Make `OnyxUpdateManager()` idempotent so it registers at most one runtime listener.
- Make `initOnyxDerivedValues()` bounded so repeated calls do not accumulate listeners (old derived listeners are disconnected before re-init).

## Next theories (not yet implemented)
- Add explicit test-only teardown hooks that disconnect registered non-UI Onyx listeners between suites.
- Evaluate strategic replacement of module-scope `Onyx.connectWithoutView()` patterns that are not needed in tests.

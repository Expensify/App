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
- [completed] Commit theory #1 fix.
- [completed] Implement and commit theory #2.
- [in_progress] Implement and commit theory #3.

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

## Theory #2 change to test
- In Jest setup, wrap `Onyx.connect()` and `Onyx.connectWithoutView()` to track all created connections.
- Add global `afterAll()` hook per test file to disconnect tracked connections and clear the tracking map.
- Goal: stop cross-file subscriber accumulation within a long-lived Jest worker.

## Theory #2 implementation notes
- Added connection tracking/cleanup in `jest/setupAfterEnv.ts`.
- This is test-only behavior and does not affect app runtime code.

## Theory #2 verification runs
- `npm_config_cache=/tmp/.npm npx eslint jest/setupAfterEnv.ts`
  - Result: PASS.
- `npm_config_cache=/tmp/.npm npx jest --runInBand --watchman=false tests/actions/OnyxUpdateManagerTest.ts tests/unit/NetworkTest.tsx -t "should trigger Onyx update gap handling|should queue request when offline"`
  - Result: PASS for matched `OnyxUpdateManager` test; no regression observed in this targeted run.

## Theory #3 change to test
- Patch `OnyxConnectionManager.connect()` / `disconnect()` (not only `Onyx.connect*`) in Jest setup.
- Track connections by lifecycle phase:
  - `persistentConnections`: created outside test execution (module scope / `beforeAll`).
  - `testConnections`: created during test execution (`beforeEach` + test body + local hooks).
- Disconnect all `testConnections` in `afterEach` to prevent in-file peak growth.
- Disconnect `persistentConnections` in `afterAll` to prevent cross-file growth.

## Theory #3 implementation notes
- Updated `jest/setupAfterEnv.ts` to hook `OnyxConnectionManager` directly.
- Kept `Onyx.connect()` / `connectWithoutView()` wrappers for complete coverage.
- This remains Jest-only and does not affect app runtime code.

## Theory #3 verification runs
- `npm_config_cache=/tmp/.npm npx eslint jest/setupAfterEnv.ts`
  - Result: PASS.
- `npm_config_cache=/tmp/.npm npx jest --runInBand --watchman=false tests/actions/OnyxUpdateManagerTest.ts tests/actions/UserTest.ts -t "should trigger Onyx update gap handling|should"`
  - Result: PASS (2 suites, 18 tests).

## Next theories (not yet implemented)
- Add explicit test-only teardown hooks that disconnect registered non-UI Onyx listeners between suites.
- Evaluate strategic replacement of module-scope `Onyx.connectWithoutView()` patterns that are not needed in tests.

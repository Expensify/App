// Preloaded via `bun test --preload` (see the `test:bun` npm script), once per test file because --isolate
// gives each file its own globals. Always run this directory through that script: several files replace `fs` or
// `child_process` with mock.module(), which without --isolate would reach every file that runs after them.
import {jest} from 'bun:test';

// GitHub Actions always sets GITHUB_REPOSITORY in CI, but local runs need a default, mirroring jest/setup.ts's
// equivalent fallback for the test files Jest still owns.
if (!('GITHUB_REPOSITORY' in process.env)) {
    process.env.GITHUB_REPOSITORY_OWNER = 'Expensify';
    process.env.GITHUB_REPOSITORY = 'Expensify/App';
}

// The code under test logs heavily, which drowns out the actual results. Jest's CI runs pass --silent for the same
// reason; `bun test` has no equivalent flag, so swap in stubs. Workflow commands that @actions/core writes straight
// to process.stdout still come through, as does anything bun:test reports about a failure.
globalThis.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

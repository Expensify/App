// Preloaded via `bun test --preload` (see the `test:bun:scripts` npm script) for the `.github/libs`/`scripts` test
// files that run under `bun:test`. GitHub Actions always sets `GITHUB_REPOSITORY` in CI, but local `bun test` runs
// need a default, mirroring jest/setup.ts's equivalent fallback for the Jest-run test files.
if (!('GITHUB_REPOSITORY' in process.env)) {
    (process.env as NodeJS.ProcessEnv).GITHUB_REPOSITORY_OWNER = 'Expensify';
    (process.env as NodeJS.ProcessEnv).GITHUB_REPOSITORY = 'Expensify/App';
}

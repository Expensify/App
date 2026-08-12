// Preloaded via `bun test --preload` (see the `test:tooling` npm script). GitHub Actions always sets
// GITHUB_REPOSITORY in CI, but local runs need a default, mirroring jest/setup.ts's equivalent fallback for the
// test files Jest still owns.
if (!('GITHUB_REPOSITORY' in process.env)) {
    process.env.GITHUB_REPOSITORY_OWNER = 'Expensify';
    process.env.GITHUB_REPOSITORY = 'Expensify/App';
}

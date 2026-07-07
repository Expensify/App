const testFileExtension = 'ts?(x)';

// Reassure runs only the performance tests, matched by the `.perf-test` suffix / `__perf__` folder,
// which it passes to Jest as `--testMatch`. We detect that from the test-runner argv so we can leave
// `performance` real for perf runs only: enabling Jest's modern fake timers globally also fakes
// `performance`, and React's Scheduler captures that (frozen) clock once at module load, which zeroes
// every React Profiler render duration — and thus every Reassure `[render]` measurement.
const isPerfTestRun = process.argv.some((arg) => arg.includes('perf-test') || arg.includes('__perf__'));

module.exports = {
    preset: 'jest-expo',
    collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx,js,jsx}', '!<rootDir>/src/**/__mocks__/**', '!<rootDir>/src/**/tests/**', '!**/*.d.ts'],
    testMatch: [
        `<rootDir>/tests/ui/**/*.${testFileExtension}`,
        `<rootDir>/tests/unit/**/*.${testFileExtension}`,
        `<rootDir>/tests/actions/**/*.${testFileExtension}`,
        `<rootDir>/tests/navigation/**/*.${testFileExtension}`,
        `<rootDir>/?(*.)+(spec|test).${testFileExtension}`,
    ],
    transform: {
        '^.+\\.[jt]sx?$': 'babel-jest',
        '^.+\\.svg?$': 'jest-transformer-svg',
    },
    transformIgnorePatterns: [
        '<rootDir>/node_modules/(?!.*(react-native|expo|react-navigation|uuid|@shopify\/flash-list).*/)',
        // Prevent Babel from transforming worklets in this file so they are treated as normal functions, otherwise FormatSelectionUtilsTest won't run.
        '<rootDir>/node_modules/@expensify/react-native-live-markdown/lib/commonjs/parseExpensiMark.js',
    ],
    testPathIgnorePatterns: [
        '<rootDir>/node_modules',
        // These test files exercise `.github/libs`/`scripts` code that depends on ESM-only `@actions/*`/`@octokit/*`
        // packages. They run under `bun test` instead (see the `test:bun:scripts` npm script), which supports real
        // ESM imports natively, so no CJS shims are needed for them.
        '<rootDir>/tests/unit/awaitStagingDeploysTest.ts',
        '<rootDir>/tests/unit/checkDeployBlockersTest.ts',
        '<rootDir>/tests/unit/CIGitLogicTest.ts',
        '<rootDir>/tests/unit/createOrUpdateDeployChecklistTest.ts',
        '<rootDir>/tests/unit/DeployChecklistUtilsTest.ts',
        '<rootDir>/tests/unit/getPullRequestIncrementalChangesTest.ts',
        '<rootDir>/tests/unit/GithubUtilsTest.ts',
        '<rootDir>/tests/unit/isAuthorizedContributorTest.ts',
        '<rootDir>/tests/unit/isDeployChecklistLockedTest.ts',
        '<rootDir>/tests/unit/markPullRequestsAsDeployedTest.ts',
        '<rootDir>/tests/unit/postOrReplaceComment.ts',
        '<rootDir>/tests/unit/waitForPreviousRunsTest.ts',
    ],
    // .worktrees/ and .claude/worktrees/ hold parallel git worktrees a developer may check out locally.
    // Each one carries its own modules/hybrid-app/package.json, which trips
    // jest-haste-map's "duplicate package name" assertion. Skip them entirely.
    modulePathIgnorePatterns: ['<rootDir>/.worktrees/', '<rootDir>/.claude/worktrees/'],
    globals: {
        __DEV__: true,
        WebSocket: {},
    },
    fakeTimers: {
        enableGlobally: true,
        // `nextTick` is never faked because Onyx notifies its subscribers on process.nextTick.
        // `performance` is left real only for perf runs (see isPerfTestRun above).
        doNotFake: isPerfTestRun ? ['nextTick', 'performance'] : ['nextTick'],
    },
    testEnvironment: 'jsdom',
    setupFiles: ['<rootDir>/jest/setupGlobalPolyfills.ts', '<rootDir>/jest/setup.ts', './node_modules/@react-native-google-signin/google-signin/jest/build/setup.js'],
    setupFilesAfterEnv: ['<rootDir>/jest/setupAfterEnv.ts', '<rootDir>/tests/perf-test/setupAfterEnv.ts'],
    cacheDirectory: '<rootDir>/.jest-cache',
    coverageReporters: ['json', 'lcov', 'text-summary'],
    moduleNameMapper: {
        '\\.(lottie)$': '<rootDir>/__mocks__/fileMock.ts',
        '^@lottiefiles/dotlottie-react$': '<rootDir>/__mocks__/@lottiefiles/dotlottie-react.tsx',
        '^group-ib-fp$': '<rootDir>/__mocks__/group-ib-fp.ts',
        '^parse-imports-exports$': '<rootDir>/node_modules/parse-imports-exports/index.cjs',
        // Some .github/libs and scripts files are real ESM (see .github/actions/javascript/package.json and the
        // .mts extension) and so use explicit ".js" specifiers on relative imports, as required by Node's ESM
        // resolution. Jest's resolver doesn't do TS's "look for the .ts source behind a .js specifier" trick on its
        // own, so strip the extension here and let Jest's normal moduleFileExtensions resolution find the .ts file.
        '^(\\.{1,2}/.*)\\.js$': '$1',
        // @actions/core v3, @actions/github v9, and these @octokit/* plugins ship pure ESM: their package.json
        // sets "type": "module" with no "require"/"default" export fallback. Jest's require()-based module
        // system refuses to load such a module synchronously ("Must use import to load ES Module"), regardless
        // of transformIgnorePatterns, because that check runs before any transform. Redirect these specifiers to
        // pre-bundled, fully self-contained CJS shims instead (see jest/buildEsmShims.ts). These are still needed
        // because GitUtilsTest.ts (via GitUtils -> GithubUtils) and jest/setup.ts import these packages directly
        // and have not been migrated to bun test.
        '^@actions/core$': '<rootDir>/jest/shims/actions-core.cjs',
        '^@actions/github/lib/utils$': '<rootDir>/jest/shims/actions-github-utils.cjs',
        '^@actions/github$': '<rootDir>/jest/shims/actions-github.cjs',
        '^@octokit/plugin-paginate-rest$': '<rootDir>/jest/shims/octokit-plugin-paginate-rest.cjs',
        '^@octokit/plugin-throttling$': '<rootDir>/jest/shims/octokit-plugin-throttling.cjs',
        '^@octokit/request-error$': '<rootDir>/jest/shims/octokit-request-error.cjs',
    },
};

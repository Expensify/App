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
        // Reassure re-transforms ~7k files under `--max-opt=1` (V8 sparkplug only), which
        // makes Babel ~half of each measure job. OXC + esbuild is native and stays fast
        // without TurboFan. Test files stay on babel-jest so `jest.mock` is still hoisted.
        '^.+\\.[jt]sx?$': isPerfTestRun ? '<rootDir>/config/babel/oxcJestTransformer.js' : 'babel-jest',
        '^.+\\.svg?$': 'jest-transformer-svg',
    },
    transformIgnorePatterns: [
        '<rootDir>/node_modules/(?!.*(react-native|expo|react-navigation|uuid|@shopify\/flash-list).*/)',
        // Prevent Babel from transforming worklets in this file so they are treated as normal functions, otherwise FormatSelectionUtilsTest won't run.
        '<rootDir>/node_modules/@expensify/react-native-live-markdown/lib/commonjs/parseExpensiMark.js',
    ],
    // tests/tooling/ covers .github/ and scripts/ and runs under `bun test` instead (see the `test:bun` npm
    // script), so those files import `bun:test` rather than Jest's globals. They aren't in testMatch above, and
    // this keeps them out even if a future testMatch entry broadens to all of tests/.
    testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/tests/tooling/'],
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
    setupFiles: ['<rootDir>/jest/setup.ts', './node_modules/@react-native-google-signin/google-signin/jest/build/setup.js'],
    setupFilesAfterEnv: ['<rootDir>/jest/setupAfterEnv.ts', '<rootDir>/tests/perf-test/setupAfterEnv.ts'],
    cacheDirectory: '<rootDir>/.jest-cache',
    coverageReporters: ['json', 'lcov', 'text-summary'],
    moduleNameMapper: {
        '\\.(lottie)$': '<rootDir>/__mocks__/fileMock.ts',
        '^@lottiefiles/dotlottie-react$': '<rootDir>/__mocks__/@lottiefiles/dotlottie-react.tsx',
        '^group-ib-fp$': '<rootDir>/__mocks__/group-ib-fp.ts',
        '^parse-imports-exports$': '<rootDir>/node_modules/parse-imports-exports/index.cjs',
    },
};

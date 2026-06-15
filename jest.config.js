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
    testPathIgnorePatterns: ['<rootDir>/node_modules'],
    // .worktrees/ holds parallel git worktrees a developer may check out locally.
    // Each one carries its own modules/hybrid-app/package.json, which trips
    // jest-haste-map's "duplicate package name" assertion. Skip them entirely.
    modulePathIgnorePatterns: ['<rootDir>/.worktrees/'],
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
        '^group-ib-fp$': '<rootDir>/__mocks__/group-ib-fp.ts',
        '^parse-imports-exports$': '<rootDir>/node_modules/parse-imports-exports/index.cjs',
    },
};

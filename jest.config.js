const testFileExtension = 'ts?(x)';
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
        '<rootDir>/node_modules/(?!.*(react-native|expo|@noble|react-navigation|uuid|@shopify\/flash-list).*/)',
        // Prevent Babel from transforming worklets in this file so they are treated as normal functions, otherwise FormatSelectionUtilsTest won't run.
        '<rootDir>/node_modules/@expensify/react-native-live-markdown/lib/commonjs/parseExpensiMark.js',
    ],
    testPathIgnorePatterns: ['<rootDir>/node_modules'],
    globals: {
        __DEV__: true,
        WebSocket: {},
    },
    fakeTimers: {
        enableGlobally: true,
        doNotFake: ['nextTick'],
    },
    testEnvironment: 'jsdom',
    setupFiles: ['<rootDir>/jest/setup.ts', './node_modules/@react-native-google-signin/google-signin/jest/build/setup.js'],
    setupFilesAfterEnv: ['<rootDir>/jest/setupAfterEnv.ts', '<rootDir>/tests/perf-test/setupAfterEnv.ts'],
    cacheDirectory: '<rootDir>/.jest-cache',
    coverageReporters: ['json', 'lcov', 'text-summary'],
    moduleNameMapper: {
        '\\.(lottie)$': '<rootDir>/__mocks__/fileMock.ts',
        '^group-ib-fp$': '<rootDir>/__mocks__/group-ib-fp.ts',
        '@noble/ed25519': '<rootDir>/node_modules/@noble/ed25519/index.ts',
        '@noble/hashes/(.*)': '<rootDir>/node_modules/@noble/hashes/src/$1.ts',
    },
};

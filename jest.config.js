const testFileExtension = '[jt]s?(x)';
module.exports = {
    // TODO: change this back to preset: 'react-native' once we upgrade to React Native >= 0.71.2
    preset: '@testing-library/react-native',
    testMatch: [
        `<rootDir>/tests/ui/**/*.${testFileExtension}`,
        `<rootDir>/tests/unit/**/*.${testFileExtension}`,
        `<rootDir>/tests/actions/**/*.${testFileExtension}`,
        `<rootDir>/?(*.)+(spec|test).${testFileExtension}`,
    ],
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
    },
    transformIgnorePatterns: [
        '<rootDir>/node_modules/(?!react-native)/',
    ],
    testPathIgnorePatterns: [
        '<rootDir>/node_modules',
    ],
    globals: {
        __DEV__: true,
        WebSocket: {},
    },
    fakeTimers: {
        enableGlobally: true,
        doNotFake: ['nextTick'],
    },
    testEnvironment: 'jsdom',
    setupFiles: [
        '<rootDir>/jest/setup.js',
    ],
    setupFilesAfterEnv: [
        '@testing-library/jest-native/extend-expect',
    ],
    cacheDirectory: '<rootDir>/.jest-cache',
};

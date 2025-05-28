const testFileExtension = 'ts?(x)';
module.exports = {
    preset: 'jest-expo',
    testMatch: [
        `<rootDir>/tests/ui/**/*.${testFileExtension}`,
        `<rootDir>/tests/unit/**/*.${testFileExtension}`,
        `<rootDir>/tests/actions/**/*.${testFileExtension}`,
        `<rootDir>/tests/navigation/**/*.${testFileExtension}`,
        `<rootDir>/?(*.)+(spec|test).${testFileExtension}`,
    ],
    transform: {
        '^.+\\.tsx?$': 'babel-jest',
        '^.+\\.svg?$': 'jest-transformer-svg',
    },
    transformIgnorePatterns: ['<rootDir>/node_modules/(?!.*(react-native|expo|react-navigation|uuid).*/)'],
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
    moduleNameMapper: {
        '\\.(lottie)$': '<rootDir>/__mocks__/fileMock.ts',
    },
};

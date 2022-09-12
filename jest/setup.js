import fs from 'fs';
import path from 'path';
import 'react-native-gesture-handler/jestSetup';
import _ from 'underscore';

require('react-native-reanimated/lib/reanimated2/jestUtils').setUpTests();

jest.mock('react-native-blob-util', () => ({}));

// These two mocks are required as per setup instructions for react-navigation testing
// https://reactnavigation.org/docs/testing/#mocking-native-modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => {};
    return Reanimated;
});

// The main app uses a NativeModule called BootSplash to show/hide a splash screen. Since we can't use this in the node environment
// where tests run we simulate a behavior where the splash screen is always hidden (similar to web which has no splash screen at all).
jest.mock('../src/libs/BootSplash', () => ({
    hide: jest.fn(),
    getVisibilityStatus: jest.fn().mockResolvedValue('hidden'),
}));

jest.mock('react-native-blob-util', () => ({}));

// Set up manual mocks for any Logging methods that are supposed hit the 'server',
// this is needed because before, the Logging queue would get flushed while tests were running,
// causing erroneous calls to HttpUtils.xhr() which would cause mock mismatches and flaky tests.
jest.mock('../src/libs/Log', () => ({
    info: jest.fn(),
    alert: jest.fn(),
    warn: jest.fn(),
    hmmm: jest.fn(),
}));

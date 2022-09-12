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

// Set up manual mocks for the Log.info method,
// this is needed because during some tests the Logging queue will get flushed,
// causing erroneous calls to HttpUtils.xhr() which could cause mock mismatches and flaky tests.
jest.mock('../src/libs/Log', () => ({
    info: jest.fn(),
}));

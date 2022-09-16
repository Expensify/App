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

// Turn off the console logs for timing events. They are not relevant for unit tests and create a lot of noise
jest.spyOn(console, 'debug').mockImplementation((...params) => {
    if (params[0].indexOf('Timing:') === 0) {
        return;
    }

    // Send the message to console.log but don't re-used console.debug or else this mock method is called in an infinite loop. Instead, just prefix the output with the word "DEBUG"
    // eslint-disable-next-line no-console
    console.log('DEBUG', ...params);
});

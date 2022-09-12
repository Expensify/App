import 'react-native-gesture-handler/jestSetup';

require('react-native-reanimated/lib/reanimated2/jestUtils').setUpTests();

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Set up manual mocks for methods used in the actions so our test does not fail.
jest.mock('../src/libs/Notification/PushNotification', () => ({
    // There is no need for a jest.fn() since we don't need to make assertions against it.
    register: () => {},
    deregister: () => {},
}));

jest.mock('react-native-blob-util', () => ({}));

// Set up manual mocks for any Logging methods that are supposed hit the 'server',
// this is needed because before, the Logging queue would get flushed while tests were running,
// causing erroneous calls to HttpUtils.xhr() which would cause mock mismatches and flaky tests.
/* eslint-disable no-console */
jest.mock('../src/libs/Log', () => ({
    info: message => console.log(`[info] ${message} (mocked)`),
    alert: message => console.log(`[alert] ${message} (mocked)`),
    warn: message => console.log(`[warn] ${message} (mocked)`),
    hmmm: message => console.log(`[hmmm] ${message} (mocked)`),
}));

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

// Set up manual mocks for the Log.info method,
// this is needed because during some tests the Logging queue will get flushed,
// causing erroneous calls to HttpUtils.xhr() which could cause mock mismatches and flaky tests.
jest.mock('../src/libs/Log', () => ({
    info: jest.fn(),
}));

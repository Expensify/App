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

// Turn off the console logs for timing events. They are not relevant for unit tests and create a lot of noise
jest.spyOn(console, 'debug').mockImplementation((...params) => {
    if (params[0].indexOf('Timing:') === 0) {
        return;
    }

    // Send the message to console.log but don't re-used console.debug or else this mock method is called in an infinite loop. Instead, just prefix the output with the word "DEBUG"
    // eslint-disable-next-line no-console
    console.log('DEBUG', ...params);
});

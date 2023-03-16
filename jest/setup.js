import 'react-native-gesture-handler/jestSetup';
import * as reanimatedJestUtils from 'react-native-reanimated/src/reanimated2/jestUtils';
import setupMockImages from './setupMockImages';

setupMockImages();
reanimatedJestUtils.setUpTests();

// This mock is required as per setup instructions for react-navigation testing
// https://reactnavigation.org/docs/testing/#mocking-native-modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// We have to mock the SQLiteStorage provider because it uses the native module SQLiteStorage, which is not available in jest.
// Mocking this file in __mocks__ does not work because jest doesn't support mocking files that are not directly used in the testing project
jest.mock('react-native-onyx/lib/storage/providers/SQLiteStorage', () => require('react-native-onyx/lib/storage/providers/__mocks__/SQLiteStorage'));

// Turn off the console logs for timing events. They are not relevant for unit tests and create a lot of noise
jest.spyOn(console, 'debug').mockImplementation((...params) => {
    if (params[0].indexOf('Timing:') === 0) {
        return;
    }

    // Send the message to console.log but don't re-used console.debug or else this mock method is called in an infinite loop. Instead, just prefix the output with the word "DEBUG"
    // eslint-disable-next-line no-console
    console.log('DEBUG', ...params);
});

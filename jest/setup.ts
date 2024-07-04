import '@shopify/flash-list/jestSetup';
import 'react-native-gesture-handler/jestSetup';
import type * as RNKeyboardController from 'react-native-keyboard-controller';
import mockStorage from 'react-native-onyx/dist/storage/__mocks__';
import type Animated from 'react-native-reanimated';
import 'setimmediate';
import mockFSLibrary from './setupMockFullstoryLib';
import setupMockImages from './setupMockImages';

setupMockImages();
mockFSLibrary();

// This mock is required as per setup instructions for react-navigation testing
// https://reactnavigation.org/docs/testing/#mocking-native-modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock react-native-onyx storage layer because the SQLite storage layer doesn't work in jest.
// Mocking this file in __mocks__ does not work because jest doesn't support mocking files that are not directly used in the testing project,
// and we only want to mock the storage layer, not the whole Onyx module.
jest.mock('react-native-onyx/dist/storage', () => mockStorage);

// Mock NativeEventEmitter as it is needed to provide mocks of libraries which include it
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// Needed for: https://stackoverflow.com/questions/76903168/mocking-libraries-in-jest
jest.mock('react-native/Libraries/LogBox/LogBox', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        ignoreLogs: jest.fn(),
        ignoreAllLogs: jest.fn(),
    },
}));

// Turn off the console logs for timing events. They are not relevant for unit tests and create a lot of noise
jest.spyOn(console, 'debug').mockImplementation((...params: string[]) => {
    if (params[0].startsWith('Timing:')) {
        return;
    }

    // Send the message to console.log but don't re-used console.debug or else this mock method is called in an infinite loop. Instead, just prefix the output with the word "DEBUG"
    // eslint-disable-next-line no-console
    console.log('DEBUG', ...params);
});

// This mock is required for mocking file systems when running tests
jest.mock('react-native-fs', () => ({
    unlink: jest.fn(
        () =>
            new Promise<void>((res) => {
                res();
            }),
    ),
    CachesDirectoryPath: jest.fn(),
}));

jest.mock('react-native-sound', () => {
    class SoundMock {
        play = jest.fn();
    }

    return SoundMock;
});

jest.mock('react-native-share', () => ({
    default: jest.fn(),
}));

jest.mock('react-native-reanimated', () => ({
    ...jest.requireActual<typeof Animated>('react-native-reanimated/mock'),
    createAnimatedPropAdapter: jest.fn,
    useReducedMotion: jest.fn,
}));

jest.mock('react-native-keyboard-controller', () => require<typeof RNKeyboardController>('react-native-keyboard-controller/jest'));

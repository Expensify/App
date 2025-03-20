/* eslint-disable max-classes-per-file */
import '@shopify/flash-list/jestSetup';
import type * as RNAppLogs from 'react-native-app-logs';
import 'react-native-gesture-handler/jestSetup';
import type * as RNKeyboardController from 'react-native-keyboard-controller';
import mockStorage from 'react-native-onyx/dist/storage/__mocks__';
import type Animated from 'react-native-reanimated';
import 'setimmediate';
import mockFSLibrary from './setupMockFullstoryLib';
import setupMockImages from './setupMockImages';

// Needed for tests to have the necessary environment variables set
if (!('GITHUB_REPOSITORY' in process.env)) {
    process.env.GITHUB_REPOSITORY_OWNER = 'Expensify';
    process.env.GITHUB_REPOSITORY = 'Expensify/App';
}

setupMockImages();
mockFSLibrary();

// This mock is required as per setup instructions for react-navigation testing
// https://reactnavigation.org/docs/testing/#mocking-native-modules
jest.mock('react-native/src/private/animated/NativeAnimatedHelper');

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
    if (params.at(0)?.startsWith('Timing:')) {
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

jest.mock('react-native-app-logs', () => require<typeof RNAppLogs>('react-native-app-logs/jest'));

jest.mock('@libs/runOnLiveMarkdownRuntime', () => {
    const runOnLiveMarkdownRuntime = <Args extends unknown[], ReturnValue>(worklet: (...args: Args) => ReturnValue) => worklet;
    return runOnLiveMarkdownRuntime;
});

jest.mock('@src/libs/actions/Timing', () => ({
    start: jest.fn(),
    end: jest.fn(),
}));

jest.mock('../modules/background-task/src/NativeReactNativeBackgroundTask', () => ({
    defineTask: jest.fn(),
    onBackgroundTaskExecution: jest.fn(),
}));

jest.mock('../modules/hybrid-app/src/NativeReactNativeHybridApp', () => ({
    isHybridApp: jest.fn(),
    closeReactNativeApp: jest.fn(),
    completeOnboarding: jest.fn(),
    switchAccount: jest.fn(),
}));

// This makes FlatList render synchronously for easier testing.
jest.mock(
    '@react-native/virtualized-lists/Interaction/Batchinator',
    () =>
        class SyncBachinator {
            #callback: () => void;

            constructor(callback: () => void) {
                this.#callback = callback;
            }

            schedule() {
                this.#callback();
            }

            dispose() {}
        },
);

jest.mock(
    '@components/InvertedFlatList/BaseInvertedFlatList/RenderTaskQueue',
    () =>
        class SyncRenderTaskQueue {
            private handler: (info: unknown) => void = () => {};

            add(info: unknown) {
                this.handler(info);
            }

            setHandler(handler: () => void) {
                this.handler = handler;
            }

            cancel() {}
        },
);

jest.mock('@libs/prepareRequestPayload/index.native.ts', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn((command: string, data: Record<string, unknown>) => {
        const formData = new FormData();

        Object.keys(data).forEach((key) => {
            const value = data[key];

            if (value === undefined) {
                return;
            }

            formData.append(key, value as string | Blob);
        });

        return Promise.resolve(formData);
    }),
}));

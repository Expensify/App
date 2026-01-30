/* eslint-disable max-classes-per-file */
import * as core from '@actions/core';
import '@shopify/flash-list/jestSetup';
import type {ReactNode} from 'react';
import {useMemo} from 'react';
import type * as RNAppLogs from 'react-native-app-logs';
import type {ReadDirItem} from 'react-native-fs';
import 'react-native-gesture-handler/jestSetup';
import type * as RNKeyboardController from 'react-native-keyboard-controller';
import mockStorage from 'react-native-onyx/dist/storage/__mocks__';
import type Animated from 'react-native-reanimated';
import 'setimmediate';
import * as MockedSecureStore from '@src/libs/MultifactorAuthentication/Biometrics/SecureStore/index.web';
import mockFSLibrary from './setupMockFullstoryLib';
import setupMockImages from './setupMockImages';
import setupMockReactNativeWorklets from './setupMockReactNativeWorklets';

// Needed for tests to have the necessary environment variables set
if (!('GITHUB_REPOSITORY' in process.env)) {
    (process.env as NodeJS.ProcessEnv).GITHUB_REPOSITORY_OWNER = 'Expensify';
    (process.env as NodeJS.ProcessEnv).GITHUB_REPOSITORY = 'Expensify/App';
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

// Mock expo-task-manager
jest.mock('expo-task-manager', () => ({
    defineTask: jest.fn(),
    // Add other methods here if you use them
}));

// Needed for: https://stackoverflow.com/questions/76903168/mocking-libraries-in-jest
jest.mock('react-native/Libraries/LogBox/LogBox', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        ignoreLogs: jest.fn(),
        ignoreAllLogs: jest.fn(),
    },
}));

const isVerbose = process.env.JEST_VERBOSE === 'true';

if (!isVerbose) {
    jest.spyOn(core, 'startGroup').mockImplementation(() => {});
    jest.spyOn(core, 'endGroup').mockImplementation(() => {});
    jest.spyOn(core, 'group').mockImplementation(<T>(_title: string, fn: () => T) => fn());
    jest.spyOn(core, 'info').mockImplementation(() => {});
    jest.spyOn(core, 'setOutput').mockImplementation(() => {});

    // Make them global to override module-level console calls
    global.console = {
        ...console,
        log: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
    } as Console;
}

// This mock is required for mocking file systems when running tests
jest.mock('react-native-fs', () => ({
    unlink: jest.fn(
        () =>
            new Promise<void>((res) => {
                res();
            }),
    ),
    readDir: jest.fn(
        () =>
            new Promise<ReadDirItem[]>((res) => {
                res([]);
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

// Jest has no access to the native secure store module, so we mock it with the web implementation.
jest.mock('@src/libs/MultifactorAuthentication/Biometrics/SecureStore', () => MockedSecureStore);

jest.mock('react-native-reanimated', () => ({
    ...jest.requireActual<typeof Animated>('react-native-reanimated/mock'),
    createAnimatedPropAdapter: jest.fn,
    useReducedMotion: jest.fn,
    useScrollViewOffset: jest.fn(() => 0),
    useAnimatedRef: jest.fn(() => jest.fn()),
    LayoutAnimationConfig: jest.fn,
    makeShareableCloneRecursive: jest.fn,
}));

setupMockReactNativeWorklets();

jest.mock('react-native-keyboard-controller', () => require<typeof RNKeyboardController>('react-native-keyboard-controller/jest'));

jest.mock('react-native-app-logs', () => require<typeof RNAppLogs>('react-native-app-logs/jest'));

jest.mock('@libs/scheduleOnLiveMarkdownRuntime', () => {
    const scheduleOnLiveMarkdownRuntime = <Args extends unknown[], ReturnValue>(worklet: (...args: Args) => ReturnValue, ...args: Args): void => {
        worklet(...args);
    };
    return scheduleOnLiveMarkdownRuntime;
});

jest.mock('@src/libs/actions/Timing', () => ({
    start: jest.fn(),
    end: jest.fn(),
    clearData: jest.fn(),
}));

jest.mock('@src/setup/telemetry', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(),
    navigationIntegration: {
        registerNavigationContainer: jest.fn(),
    },
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
    clearOldDotAfterSignOut: jest.fn(),
}));

const mockUseMemo = useMemo;

// Mock lazy asset loading to be synchronous in tests
jest.mock('../src/hooks/useLazyAsset.ts', () => ({
    useMemoizedLazyAsset: jest.fn((importFn) =>
        mockUseMemo(() => {
            // Return a mock asset immediately to avoid async loading in tests
            const mockAsset = {
                src: 'mock-icon',
                testID: 'mock-asset',
                // Add common icon properties that tests might expect
                height: 20,
                width: 20,
            };

            return {
                asset: mockAsset,
                isLoaded: true,
                isLoading: false,
                hasError: false,
            };
        }, [importFn]),
    ),
    useMemoizedLazyIllustrations: jest.fn((names: readonly string[]) =>
        mockUseMemo(() => {
            // Return a Record with all requested illustration names
            const mockIllustrations: Record<string, unknown> = {};
            for (const name of names) {
                mockIllustrations[name] = {
                    src: `mock-${name}`,
                    testID: `mock-illustration-${name}`,
                    height: 20,
                    width: 20,
                };
            }
            return mockIllustrations;

            // Use a value-based dependency to avoid returning a new object caused by reference changes on names
        }, [names.join(',')]),
    ),
    useMemoizedLazyExpensifyIcons: jest.fn((names: readonly string[]) =>
        mockUseMemo(() => {
            // Return a Record with all requested icon names
            const mockIcons: Record<string, unknown> = {};
            for (const name of names) {
                mockIcons[name] = {
                    src: `mock-${name}`,
                    testID: `mock-expensify-icon-${name}`,
                    height: 20,
                    width: 20,
                };
            }
            return mockIcons;

            // Use a value-based dependency to avoid returning a new object caused by reference changes on names
        }, [names.join(',')]),
    ),
    default: jest.fn((importFn) =>
        mockUseMemo(() => {
            const mockAsset = {src: 'mock-icon', testID: 'mock-asset'};
            return {
                asset: mockAsset,
                isLoaded: true,
                isLoading: false,
                hasError: false,
            };
        }, [importFn]),
    ),
}));

// Mock icon loading functions to resolve immediately
jest.mock('../src/components/Icon/ExpensifyIconLoader.ts', () => ({
    loadExpensifyIcon: jest.fn((iconName) => {
        const mockIcon = {
            src: `mock-${iconName}`,
            testID: `mock-icon-${iconName}`,
            height: 20,
            width: 20,
        };
        return Promise.resolve({default: mockIcon});
    }),
}));

jest.mock(
    '@components/InvertedFlatList/RenderTaskQueue',
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

        for (const key of Object.keys(data)) {
            const value = data[key];

            if (value === undefined) {
                continue;
            }

            formData.append(key, value as string | Blob);
        }

        return Promise.resolve(formData);
    }),
}));

// This keeps the error "@rnmapbox/maps native code not available." from causing the tests to fail
jest.mock('@components/ConfirmedRoute.tsx');

jest.mock('@src/hooks/useWorkletStateMachine/runOnUISync', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(() => jest.fn()), // Return a function that returns a function
}));

jest.mock('react-native-nitro-sqlite', () => ({
    open: jest.fn(),
}));

jest.mock('@shopify/react-native-skia', () => ({
    useFont: jest.fn(() => null),
    matchFont: jest.fn(() => null),
    listFontFamilies: jest.fn(() => []),
}));

jest.mock('victory-native', () => ({
    Bar: jest.fn(() => null),
    CartesianChart: jest.fn(
        ({children}: {children?: (args: Record<string, unknown>) => ReactNode}) => children?.({points: {y: []}, chartBounds: {left: 0, right: 0, top: 0, bottom: 0}}) ?? null,
    ),
}));

// Provide a default global fetch mock for tests that do not explicitly set it up
// This avoids ReferenceError: fetch is not defined in CI when coverage is enabled
const globalWithOptionalFetch: typeof globalThis & {fetch?: unknown} = globalThis as typeof globalThis & {fetch?: unknown};
if (typeof globalWithOptionalFetch.fetch !== 'function') {
    const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {get: () => null},
        // Return a minimal shape our code expects
        json: () => Promise.resolve({jsonCode: 200}),
    };

    Object.defineProperty(globalWithOptionalFetch, 'fetch', {
        value: jest.fn(() => Promise.resolve(mockResponse)),
        writable: true,
        configurable: true,
    });
}

jest.mock('@components/ActionSheetAwareScrollView/index');
jest.mock('@components/ActionSheetAwareScrollView/index.ios');
jest.mock('@components/ActionSheetAwareScrollView/index.android');
jest.mock('@components/ActionSheetAwareScrollView/ActionSheetAwareScrollViewContext');

jest.mock('@src/components/KeyboardDismissibleFlatList/KeyboardDismissibleFlatListContext');

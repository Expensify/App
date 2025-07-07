"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable max-classes-per-file */
require("@shopify/flash-list/jestSetup");
require("react-native-gesture-handler/jestSetup");
var __mocks__1 = require("react-native-onyx/dist/storage/__mocks__");
require("setimmediate");
var setupMockFullstoryLib_1 = require("./setupMockFullstoryLib");
var setupMockImages_1 = require("./setupMockImages");
// Needed for tests to have the necessary environment variables set
if (!('GITHUB_REPOSITORY' in process.env)) {
    process.env.GITHUB_REPOSITORY_OWNER = 'Expensify';
    process.env.GITHUB_REPOSITORY = 'Expensify/App';
}
(0, setupMockImages_1.default)();
(0, setupMockFullstoryLib_1.default)();
// This mock is required as per setup instructions for react-navigation testing
// https://reactnavigation.org/docs/testing/#mocking-native-modules
jest.mock('react-native/src/private/animated/NativeAnimatedHelper');
// Mock react-native-onyx storage layer because the SQLite storage layer doesn't work in jest.
// Mocking this file in __mocks__ does not work because jest doesn't support mocking files that are not directly used in the testing project,
// and we only want to mock the storage layer, not the whole Onyx module.
jest.mock('react-native-onyx/dist/storage', function () { return __mocks__1.default; });
// Mock NativeEventEmitter as it is needed to provide mocks of libraries which include it
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
// Needed for: https://stackoverflow.com/questions/76903168/mocking-libraries-in-jest
jest.mock('react-native/Libraries/LogBox/LogBox', function () { return ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: {
        ignoreLogs: jest.fn(),
        ignoreAllLogs: jest.fn(),
    },
}); });
// Turn off the console logs for timing events. They are not relevant for unit tests and create a lot of noise
jest.spyOn(console, 'debug').mockImplementation(function () {
    var _a;
    var params = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        params[_i] = arguments[_i];
    }
    if ((_a = params.at(0)) === null || _a === void 0 ? void 0 : _a.startsWith('Timing:')) {
        return;
    }
    // Send the message to console.log but don't re-used console.debug or else this mock method is called in an infinite loop. Instead, just prefix the output with the word "DEBUG"
    // eslint-disable-next-line no-console
    console.log.apply(console, __spreadArray(['DEBUG'], params, false));
});
// This mock is required for mocking file systems when running tests
jest.mock('react-native-fs', function () { return ({
    unlink: jest.fn(function () {
        return new Promise(function (res) {
            res();
        });
    }),
    CachesDirectoryPath: jest.fn(),
}); });
jest.mock('react-native-sound', function () {
    var SoundMock = /** @class */ (function () {
        function SoundMock() {
            this.play = jest.fn();
        }
        return SoundMock;
    }());
    return SoundMock;
});
jest.mock('react-native-share', function () { return ({
    default: jest.fn(),
}); });
jest.mock('react-native-reanimated', function () { return (__assign(__assign({}, jest.requireActual('react-native-reanimated/mock')), { createAnimatedPropAdapter: jest.fn, useReducedMotion: jest.fn, useScrollViewOffset: jest.fn(function () { return 0; }), useAnimatedRef: jest.fn(function () { return jest.fn(); }), LayoutAnimationConfig: jest.fn })); });
jest.mock('react-native-keyboard-controller', function () { return require('react-native-keyboard-controller/jest'); });
jest.mock('react-native-app-logs', function () { return require('react-native-app-logs/jest'); });
jest.mock('@libs/runOnLiveMarkdownRuntime', function () {
    var runOnLiveMarkdownRuntime = function (worklet) { return worklet; };
    return runOnLiveMarkdownRuntime;
});
jest.mock('@src/libs/actions/Timing', function () { return ({
    start: jest.fn(),
    end: jest.fn(),
    clearData: jest.fn(),
}); });
jest.mock('../modules/background-task/src/NativeReactNativeBackgroundTask', function () { return ({
    defineTask: jest.fn(),
    onBackgroundTaskExecution: jest.fn(),
}); });
jest.mock('../modules/hybrid-app/src/NativeReactNativeHybridApp', function () { return ({
    isHybridApp: jest.fn(),
    closeReactNativeApp: jest.fn(),
    completeOnboarding: jest.fn(),
    switchAccount: jest.fn(),
}); });
jest.mock('@components/InvertedFlatList/BaseInvertedFlatList/RenderTaskQueue', function () {
    return /** @class */ (function () {
        function SyncRenderTaskQueue() {
            this.handler = function () { };
        }
        SyncRenderTaskQueue.prototype.add = function (info) {
            this.handler(info);
        };
        SyncRenderTaskQueue.prototype.setHandler = function (handler) {
            this.handler = handler;
        };
        SyncRenderTaskQueue.prototype.cancel = function () { };
        return SyncRenderTaskQueue;
    }());
});
jest.mock('@libs/prepareRequestPayload/index.native.ts', function () { return ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(function (command, data) {
        var formData = new FormData();
        Object.keys(data).forEach(function (key) {
            var value = data[key];
            if (value === undefined) {
                return;
            }
            formData.append(key, value);
        });
        return Promise.resolve(formData);
    }),
}); });
// This keeps the error "@rnmapbox/maps native code not available." from causing the tests to fail
jest.mock('@components/ConfirmedRoute.tsx');
jest.mock('@src/hooks/useWorkletStateMachine/executeOnUIRuntimeSync', function () { return ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(function () { return jest.fn(); }), // Return a function that returns a function
}); });
jest.mock('react-native-nitro-sqlite', function () { return ({
    open: jest.fn(),
}); });

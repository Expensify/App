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
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line no-restricted-imports
var ReactNative = require("react-native");
var BootSplash = ReactNative.NativeModules.BootSplash;
jest.doMock('react-native', function () {
    var url = 'https://new.expensify.com/';
    var getInitialURL = function () { return Promise.resolve(url); };
    var appState = 'active';
    var count = 0;
    var changeListeners = {};
    // Tests will run with the app in a typical small screen size by default. We do this since the react-native test renderer
    // runs against index.native.js source and so anything that is testing a component reliant on withWindowDimensions()
    // would be most commonly assumed to be on a mobile phone vs. a tablet or desktop style view. This behavior can be
    // overridden by explicitly setting the dimensions inside a test via Dimensions.set()
    var dimensions = {
        width: 300,
        height: 700,
        scale: 1,
        fontScale: 1,
    };
    var reactNativeMock = Object.setPrototypeOf({
        NativeModules: __assign(__assign({}, ReactNative.NativeModules), { BootSplash: {
                hide: jest.fn(),
                logoSizeRatio: 1,
                navigationBarHeight: 0,
            }, StartupTimer: { stop: jest.fn() } }),
        Linking: __assign(__assign({}, ReactNative.Linking), { getInitialURL: getInitialURL, setInitialURL: function (newUrl) {
                url = newUrl;
            } }),
        AppState: __assign(__assign({}, ReactNative.AppState), { get currentState() {
                return appState;
            }, emitCurrentTestState: function (state) {
                appState = state;
                Object.entries(changeListeners).forEach(function (_a) {
                    var listener = _a[1];
                    return listener(appState);
                });
            }, addEventListener: function (type, listener) {
                if (type === 'change') {
                    var originalCount_1 = count;
                    changeListeners[originalCount_1] = listener;
                    ++count;
                    return {
                        remove: function () {
                            delete changeListeners[originalCount_1];
                        },
                    };
                }
                return ReactNative.AppState.addEventListener(type, listener);
            } }),
        Dimensions: __assign(__assign({}, ReactNative.Dimensions), { addEventListener: jest.fn(function () { return ({ remove: jest.fn() }); }), get: function () { return dimensions; }, set: function (newDimensions) {
                dimensions = newDimensions;
            } }),
        // `runAfterInteractions` method would normally be triggered after the native animation is completed,
        // we would have to mock waiting for the animation end and more state changes,
        // so it seems easier to just run the callback immediately in tests.
        InteractionManager: __assign(__assign({}, ReactNative.InteractionManager), { runAfterInteractions: function (callback) {
                callback();
                return { cancel: function () { } };
            } }),
    }, ReactNative);
    return reactNativeMock;
});

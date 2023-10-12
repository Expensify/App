// eslint-disable-next-line no-restricted-imports
import * as ReactNative from 'react-native';
import _ from 'underscore';

jest.doMock('react-native', () => {
    let url = 'https://new.expensify.com/';
    const getInitialURL = () => Promise.resolve(url);

    let appState = 'active';
    let count = 0;
    const changeListeners = {};

    // Tests will run with the app in a typical small screen size by default. We do this since the react-native test renderer
    // runs against index.native.js source and so anything that is testing a component reliant on withWindowDimensions()
    // would be most commonly assumed to be on a mobile phone vs. a tablet or desktop style view. This behavior can be
    // overridden by explicitly setting the dimensions inside a test via Dimensions.set()
    let dimensions = {
        width: 300,
        height: 700,
        scale: 1,
        fontScale: 1,
    };

    return Object.setPrototypeOf(
        {
            NativeModules: {
                ...ReactNative.NativeModules,
                BootSplash: {
                    getVisibilityStatus: jest.fn(),
                    hide: jest.fn(),
                    navigationBarHeight: 0,
                },
                StartupTimer: {stop: jest.fn()},
            },
            Linking: {
                ...ReactNative.Linking,
                getInitialURL,
                setInitialURL(newUrl) {
                    url = newUrl;
                },
            },
            AppState: {
                ...ReactNative.AppState,
                get currentState() {
                    return appState;
                },
                emitCurrentTestState(state) {
                    appState = state;
                    _.each(changeListeners, (listener) => listener(appState));
                },
                addEventListener(type, listener) {
                    if (type === 'change') {
                        const originalCount = count;
                        changeListeners[originalCount] = listener;
                        ++count;
                        return {
                            remove: () => {
                                delete changeListeners[originalCount];
                            },
                        };
                    }

                    return ReactNative.AppState.addEventListener(type, listener);
                },
            },
            Dimensions: {
                ...ReactNative.Dimensions,
                addEventListener: jest.fn(),
                get: () => dimensions,
                set: (newDimensions) => {
                    dimensions = newDimensions;
                },
            },

            // `runAfterInteractions` method would normally be triggered after the native animation is completed,
            // we would have to mock waiting for the animation end and more state changes,
            // so it seems easier to just run the callback immediately in tests.
            InteractionManager: {
                ...ReactNative.InteractionManager,
                runAfterInteractions: (callback) => callback(),
            },
        },
        ReactNative,
    );
});

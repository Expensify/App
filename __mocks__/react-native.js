/* eslint-disable arrow-body-style */
// eslint-disable-next-line no-restricted-imports
import * as ReactNative from 'react-native';
import _ from 'underscore';

jest.doMock('react-native', () => {
    let url = 'https://new.expensify.com/';
    const getInitialURL = () => {
        return Promise.resolve(url);
    };

    let appState = 'active';
    let count = 0;
    const changeListeners = {};
    return Object.setPrototypeOf(
        {
            NativeModules: {
                ...ReactNative.NativeModules,
                BootSplash: {
                    getVisibilityStatus: jest.fn(),
                    hide: jest.fn(),
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
                    _.each(changeListeners, listener => listener(appState));
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
                get: () => ({
                    width: 300, height: 700, scale: 1, fontScale: 1,
                }),
            },
        },
        ReactNative,
    );
});

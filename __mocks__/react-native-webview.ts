import type ReactNative from 'react-native';

jest.mock('react-native-webview', () => {
    const {View} = require<typeof ReactNative>('react-native');
    return {
        WebView: () => View,
    };
});

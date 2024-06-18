import type {View as RNView} from 'react-native';

type ReactNative = {View: RNView};

jest.mock('react-native-webview', () => {
    const {View} = require<ReactNative>('react-native');
    return {
        WebView: () => View,
    };
});

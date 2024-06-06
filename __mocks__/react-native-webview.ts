import type {View as RNView} from 'react-native';

jest.mock('react-native-webview', () => {
    const {View} = require<{View: RNView}>('react-native');
    return {
        WebView: () => View,
    };
});

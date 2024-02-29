import type {View as RNView} from 'react-native';

jest.mock('react-native-webview', () => {
    const {View} = require('react-native');
    return {
        WebView: () => View as RNView,
    };
});

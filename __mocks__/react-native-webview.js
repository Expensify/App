jest.mock('react-native-webview', () => {
    const {View} = require('react-native');
    return {
        WebView: () => View,
    };
});

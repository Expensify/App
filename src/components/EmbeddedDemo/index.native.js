"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_webview_1 = require("react-native-webview");
var useOnboardingMessages_1 = require("@hooks/useOnboardingMessages");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function EmbeddedDemo(_a) {
    var url = _a.url, webViewProps = _a.webViewProps;
    var styles = (0, useThemeStyles_1.default)();
    var testDrive = (0, useOnboardingMessages_1.default)().testDrive;
    return (<react_native_webview_1.default source={{ uri: url }} originWhitelist={testDrive.EMBEDDED_DEMO_WHITELIST} style={styles.flex1} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...webViewProps}/>);
}
EmbeddedDemo.displayName = 'EmbeddedDemo';
exports.default = EmbeddedDemo;

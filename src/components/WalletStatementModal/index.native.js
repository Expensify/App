"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_webview_1 = require("react-native-webview");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var useOnyx_1 = require("@hooks/useOnyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var walletNavigationUtils_1 = require("./walletNavigationUtils");
var renderLoading = function () { return <FullscreenLoadingIndicator_1.default />; };
function WalletStatementModal(_a) {
    var _b;
    var statementPageURL = _a.statementPageURL;
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: true })[0];
    var webViewRef = (0, react_1.useRef)(null);
    var authToken = (_b = session === null || session === void 0 ? void 0 : session.authToken) !== null && _b !== void 0 ? _b : null;
    var onMessage = (0, react_1.useCallback)(function (event) {
        try {
            var parsedData = JSON.parse(event.nativeEvent.data);
            var _a = parsedData || {}, type = _a.type, url = _a.url;
            if (!webViewRef.current) {
                return;
            }
            (0, walletNavigationUtils_1.default)(type, url);
        }
        catch (error) {
            console.error('Error parsing message from WebView:', error);
        }
    }, []);
    return (<react_native_webview_1.WebView ref={webViewRef} originWhitelist={['https://*']} source={{
            uri: statementPageURL,
            headers: {
                Cookie: "authToken=".concat(authToken),
            },
        }} incognito // 'incognito' prop required for Android, issue here https://github.com/react-native-webview/react-native-webview/issues/1352
     startInLoadingState renderLoading={renderLoading} onMessage={onMessage}/>);
}
WalletStatementModal.displayName = 'WalletStatementModal';
exports.default = WalletStatementModal;

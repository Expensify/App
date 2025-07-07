"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var walletNavigationUtils_1 = require("./walletNavigationUtils");
function WalletStatementModal(_a) {
    var _b;
    var statementPageURL = _a.statementPageURL;
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: true })[0];
    var styles = (0, useThemeStyles_1.default)();
    var _c = (0, react_1.useState)(true), isLoading = _c[0], setIsLoading = _c[1];
    var authToken = (_b = session === null || session === void 0 ? void 0 : session.authToken) !== null && _b !== void 0 ? _b : null;
    /**
     * Handles in-app navigation for iframe links
     */
    var navigate = function (event) {
        var data = event.data;
        var _a = data || {}, type = _a.type, url = _a.url;
        (0, walletNavigationUtils_1.default)(type, url);
    };
    return (<>
            {isLoading && <FullscreenLoadingIndicator_1.default />}
            <react_native_1.View style={[styles.flex1]}>
                <iframe src={"".concat(statementPageURL, "&authToken=").concat(authToken)} title="Statements" height="100%" width="100%" seamless frameBorder="0" onLoad={function () {
            setIsLoading(false);
            // We listen to a message sent from the iframe to the parent component when a link is clicked.
            // This lets us handle navigation in the app, outside of the iframe.
            window.onmessage = navigate;
        }}/>
            </react_native_1.View>
        </>);
}
WalletStatementModal.displayName = 'WalletStatementModal';
exports.default = WalletStatementModal;

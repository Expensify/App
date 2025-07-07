"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_plaid_link_1 = require("react-plaid-link");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Log_1 = require("@libs/Log");
function PlaidLink(_a) {
    var token = _a.token, _b = _a.onSuccess, onSuccess = _b === void 0 ? function () { } : _b, _c = _a.onError, onError = _c === void 0 ? function () { } : _c, _d = _a.onExit, onExit = _d === void 0 ? function () { } : _d, onEvent = _a.onEvent, receivedRedirectURI = _a.receivedRedirectURI;
    var _e = (0, react_1.useState)(false), isPlaidLoaded = _e[0], setIsPlaidLoaded = _e[1];
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var successCallback = (0, react_1.useCallback)(function (publicToken, metadata) {
        onSuccess({ publicToken: publicToken, metadata: metadata });
    }, [onSuccess]);
    var _f = (0, react_plaid_link_1.usePlaidLink)({
        token: token,
        onSuccess: successCallback,
        onExit: function (exitError, metadata) {
            Log_1.default.info('[PlaidLink] Exit: ', false, { exitError: exitError, metadata: metadata });
            onExit();
        },
        onEvent: function (event, metadata) {
            Log_1.default.info('[PlaidLink] Event: ', false, { event: event, metadata: metadata });
            onEvent(event, metadata);
        },
        onLoad: function () { return setIsPlaidLoaded(true); },
        // The redirect URI with an OAuth state ID. Needed to re-initialize the PlaidLink after directing the
        // user to their respective bank platform
        receivedRedirectUri: receivedRedirectURI,
    }), open = _f.open, ready = _f.ready, error = _f.error;
    (0, react_1.useEffect)(function () {
        if (error) {
            onError(error);
            return;
        }
        if (!ready) {
            return;
        }
        if (!isPlaidLoaded) {
            return;
        }
        open();
    }, [ready, error, isPlaidLoaded, open, onError]);
    return (<react_native_1.View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
            <react_native_1.ActivityIndicator color={theme.spinner} size="large"/>
        </react_native_1.View>);
}
PlaidLink.displayName = 'PlaidLink';
exports.default = PlaidLink;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_config_1 = require("react-native-config");
var Session_1 = require("@libs/actions/Session");
var Localize_1 = require("@libs/Localize");
var Log_1 = require("@libs/Log");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var AppleSignInLocales_1 = require("./AppleSignInLocales");
// react-native-config doesn't trim whitespace on iOS for some reason so we
// add a trim() call to lodashGet here to prevent headaches.
var getConfig = function (config, key, defaultValue) { var _a; return ((_a = config === null || config === void 0 ? void 0 : config[key]) !== null && _a !== void 0 ? _a : defaultValue).trim(); };
/**
 * Apple Sign In Configuration for Web.
 */
var config = {
    clientId: getConfig(react_native_config_1.default, 'ASI_CLIENTID_OVERRIDE', CONFIG_1.default.APPLE_SIGN_IN.SERVICE_ID),
    scope: 'name email',
    // never used, but required for configuration
    redirectURI: getConfig(react_native_config_1.default, 'ASI_REDIRECTURI_OVERRIDE', CONFIG_1.default.APPLE_SIGN_IN.REDIRECT_URI),
    state: '',
    nonce: '',
    usePopup: true,
};
/**
 * Apple Sign In success and failure listeners.
 */
var successListener = function (event) {
    var token = event.detail.authorization.id_token;
    (0, Session_1.beginAppleSignIn)(token);
};
var failureListener = function (event) {
    if (!event.detail || event.detail.error === 'popup_closed_by_user') {
        return null;
    }
    Log_1.default.warn("Apple sign-in failed: ".concat(event.detail.error));
};
/**
 * Apple Sign In button for Web.
 */
function AppleSignInDiv(_a) {
    var isDesktopFlow = _a.isDesktopFlow, onPointerDown = _a.onPointerDown;
    (0, react_1.useEffect)(function () {
        // `init` renders the button, so it must be called after the div is
        // first mounted.
        window.AppleID.auth.init(config);
    }, []);
    //  Result listeners need to live within the focused item to avoid duplicate
    //  side effects on success and failure.
    react_1.default.useEffect(function () {
        document.addEventListener('AppleIDSignInOnSuccess', successListener);
        document.addEventListener('AppleIDSignInOnFailure', failureListener);
        return function () {
            document.removeEventListener('AppleIDSignInOnSuccess', successListener);
            document.removeEventListener('AppleIDSignInOnFailure', failureListener);
        };
    }, []);
    return isDesktopFlow ? (<div id="appleid-signin" data-mode="center-align" data-type="continue" data-color="white" data-border="false" data-border-radius="50" data-width={CONST_1.default.SIGN_IN_FORM_WIDTH} data-height="52" style={{ cursor: 'pointer' }} onPointerDown={onPointerDown}/>) : (<div id="appleid-signin" data-mode="logo-only" data-type="sign in" data-color="white" data-border="false" data-border-radius="50" data-size="40" style={{ cursor: 'pointer' }} onPointerDown={onPointerDown}/>);
}
// The Sign in with Apple script may fail to render button if there are multiple
// of these divs present in the app, as it matches based on div id. So we'll
// only mount the div when it should be visible.
function SingletonAppleSignInButton(_a) {
    var isDesktopFlow = _a.isDesktopFlow, onPointerDown = _a.onPointerDown;
    var isFocused = (0, native_1.useIsFocused)();
    if (!isFocused) {
        return null;
    }
    return (<AppleSignInDiv isDesktopFlow={isDesktopFlow} onPointerDown={onPointerDown}/>);
}
function AppleSignIn(_a) {
    var _b = _a.isDesktopFlow, isDesktopFlow = _b === void 0 ? false : _b, onPointerDown = _a.onPointerDown;
    var _c = (0, react_1.useState)(false), scriptLoaded = _c[0], setScriptLoaded = _c[1];
    (0, react_1.useEffect)(function () {
        if (window.appleAuthScriptLoaded) {
            return;
        }
        var localeCode = AppleSignInLocales_1.default[(0, Localize_1.getDevicePreferredLocale)()];
        var script = document.createElement('script');
        script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1//".concat(localeCode, "/appleid.auth.js");
        script.async = true;
        script.onload = function () { return setScriptLoaded(true); };
        document.body.appendChild(script);
    }, []);
    if (scriptLoaded === false) {
        return null;
    }
    return (<SingletonAppleSignInButton isDesktopFlow={isDesktopFlow} onPointerDown={onPointerDown}/>);
}
AppleSignIn.displayName = 'AppleSignIn';
exports.default = AppleSignIn;

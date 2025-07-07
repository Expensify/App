"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_apple_authentication_1 = require("@invertase/react-native-apple-authentication");
var react_1 = require("react");
var IconButton_1 = require("@components/SignInButtons/IconButton");
var Log_1 = require("@libs/Log");
var Session = require("@userActions/Session");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
/**
 * Apple Sign In Configuration for Android.
 */
var config = {
    clientId: CONFIG_1.default.APPLE_SIGN_IN.SERVICE_ID,
    redirectUri: CONFIG_1.default.APPLE_SIGN_IN.REDIRECT_URI,
    responseType: react_native_apple_authentication_1.appleAuthAndroid.ResponseType.ALL,
    scope: react_native_apple_authentication_1.appleAuthAndroid.Scope.ALL,
};
/**
 * Apple Sign In method for Android that returns authToken.
 * @returns Promise that returns a string when resolved
 */
function appleSignInRequest() {
    react_native_apple_authentication_1.appleAuthAndroid.configure(config);
    return react_native_apple_authentication_1.appleAuthAndroid
        .signIn()
        .then(function (response) { return response.id_token; })
        .catch(function (e) {
        throw e;
    });
}
/**
 * Apple Sign In button for Android.
 */
function AppleSignIn(_a) {
    var _b = _a.onPress, onPress = _b === void 0 ? function () { } : _b;
    var handleSignIn = function () {
        appleSignInRequest()
            .then(function (token) { return Session.beginAppleSignIn(token); })
            .catch(function (error) {
            if (error.message === react_native_apple_authentication_1.appleAuthAndroid.Error.SIGNIN_CANCELLED) {
                return null;
            }
            Log_1.default.alert('[Apple Sign In] Apple authentication failed', error);
        });
    };
    return (<IconButton_1.default onPress={function () {
            onPress();
            handleSignIn();
        }} provider={CONST_1.default.SIGN_IN_METHOD.APPLE}/>);
}
AppleSignIn.displayName = 'AppleSignIn';
exports.default = AppleSignIn;

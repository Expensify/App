"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var google_signin_1 = require("@react-native-google-signin/google-signin");
var react_1 = require("react");
var IconButton_1 = require("@components/SignInButtons/IconButton");
var Log_1 = require("@libs/Log");
var Session = require("@userActions/Session");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
/**
 * Google Sign In method for iOS and android that returns identityToken.
 */
function googleSignInRequest() {
    google_signin_1.GoogleSignin.configure({
        webClientId: CONFIG_1.default.GOOGLE_SIGN_IN.WEB_CLIENT_ID,
        iosClientId: CONFIG_1.default.GOOGLE_SIGN_IN.IOS_CLIENT_ID,
        offlineAccess: false,
    });
    // The package on android can sign in without prompting
    // the user which is not what we want. So we sign out
    // before signing in to ensure the user is prompted.
    google_signin_1.GoogleSignin.signOut();
    google_signin_1.GoogleSignin.signIn()
        .then(function (response) { return response.idToken; })
        .then(function (token) { return Session.beginGoogleSignIn(token); })
        .catch(function (error) {
        // Handle unexpected error shape
        if ((error === null || error === void 0 ? void 0 : error.code) === undefined) {
            Log_1.default.alert("[Google Sign In] Google sign in failed: ".concat(JSON.stringify(error)));
            return;
        }
        /** The logged code is useful for debugging any new errors that are not specifically handled. To decode, see:
          - The common status codes documentation: https://developers.google.com/android/reference/com/google/android/gms/common/api/CommonStatusCodes
          - The Google Sign In codes documentation: https://developers.google.com/android/reference/com/google/android/gms/auth/api/signin/GoogleSignInStatusCodes
        */
        if (error.code === google_signin_1.statusCodes.SIGN_IN_CANCELLED) {
            Log_1.default.info('[Google Sign In] Google Sign In cancelled');
        }
        else {
            Log_1.default.alert("[Google Sign In] Error Code: ".concat(error.code, ". ").concat(error.message), {}, false);
        }
    });
}
/**
 * Google Sign In button for iOS.
 */
function GoogleSignIn(_a) {
    var _b = _a.onPress, onPress = _b === void 0 ? function () { } : _b;
    return (<IconButton_1.default onPress={function () {
            onPress();
            googleSignInRequest();
        }} provider={CONST_1.default.SIGN_IN_METHOD.GOOGLE}/>);
}
GoogleSignIn.displayName = 'GoogleSignIn';
exports.default = GoogleSignIn;

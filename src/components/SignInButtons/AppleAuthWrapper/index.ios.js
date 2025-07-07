"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_apple_authentication_1 = require("@invertase/react-native-apple-authentication");
var react_1 = require("react");
var Session = require("@userActions/Session");
/**
 * Apple Sign In wrapper for iOS
 * revokes the session if the credential is revoked.
 */
function AppleAuthWrapper() {
    (0, react_1.useEffect)(function () {
        if (!react_native_apple_authentication_1.default.isSupported) {
            return;
        }
        var removeListener = react_native_apple_authentication_1.default.onCredentialRevoked(function () {
            Session.signOut();
        });
        return function () {
            removeListener();
        };
    }, []);
    return null;
}
exports.default = AppleAuthWrapper;

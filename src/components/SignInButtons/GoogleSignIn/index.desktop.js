"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var IconButton_1 = require("@components/SignInButtons/IconButton");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var googleSignInWebRouteForDesktopFlow = "".concat(CONFIG_1.default.EXPENSIFY.NEW_EXPENSIFY_URL).concat(ROUTES_1.default.GOOGLE_SIGN_IN);
/**
 * Google Sign In button for desktop flow.
 */
function GoogleSignIn() {
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_1.View style={styles.desktopSignInButtonContainer}>
            <IconButton_1.default onPress={function () {
            window.open(googleSignInWebRouteForDesktopFlow);
        }} provider={CONST_1.default.SIGN_IN_METHOD.GOOGLE}/>
        </react_native_1.View>);
}
GoogleSignIn.displayName = 'GoogleSignIn';
exports.default = GoogleSignIn;

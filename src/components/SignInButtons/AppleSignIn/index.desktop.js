"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var IconButton_1 = require("@components/SignInButtons/IconButton");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var appleSignInWebRouteForDesktopFlow = "".concat(CONFIG_1.default.EXPENSIFY.NEW_EXPENSIFY_URL).concat(ROUTES_1.default.APPLE_SIGN_IN);
/**
 * Apple Sign In button for desktop flow
 */
function AppleSignIn() {
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_1.View style={styles.desktopSignInButtonContainer}>
            <IconButton_1.default onPress={function () {
            window.open(appleSignInWebRouteForDesktopFlow);
        }} provider={CONST_1.default.SIGN_IN_METHOD.APPLE}/>
        </react_native_1.View>);
}
AppleSignIn.displayName = 'AppleSignIn';
exports.default = AppleSignIn;

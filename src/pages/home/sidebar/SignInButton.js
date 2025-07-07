"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Session_1 = require("@userActions/Session");
var CONST_1 = require("@src/CONST");
function SignInButton() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<PressableWithoutFeedback_1.default accessibilityLabel={translate('sidebarScreen.buttonMySettings')} role={CONST_1.default.ROLE.BUTTON} onPress={function () { return (0, Session_1.signOutAndRedirectToSignIn)(); }}>
            <react_native_1.View style={(styles.signInButtonAvatar, styles.ph2)}>
                <Button_1.default success text={translate('common.signIn')} onPress={function () { return (0, Session_1.signOutAndRedirectToSignIn)(); }}/>
            </react_native_1.View>
        </PressableWithoutFeedback_1.default>);
}
SignInButton.displayName = 'SignInButton';
exports.default = SignInButton;

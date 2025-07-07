"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var providerData = (_a = {},
    _a[CONST_1.default.SIGN_IN_METHOD.APPLE] = {
        icon: Expensicons.AppleLogo,
        accessibilityLabel: 'common.signInWithApple',
    },
    _a[CONST_1.default.SIGN_IN_METHOD.GOOGLE] = {
        icon: Expensicons.GoogleLogo,
        accessibilityLabel: 'common.signInWithGoogle',
    },
    _a);
function IconButton(_a) {
    var _b = _a.onPress, onPress = _b === void 0 ? function () { } : _b, provider = _a.provider;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    return (<PressableWithoutFeedback_1.default onPress={onPress} style={styles.signInIconButton} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate(providerData[provider].accessibilityLabel)}>
            <Icon_1.default src={providerData[provider].icon} height={40} width={40}/>
        </PressableWithoutFeedback_1.default>);
}
IconButton.displayName = 'IconButton';
exports.default = IconButton;

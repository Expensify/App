"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
function SignInHeroCopy(_a) {
    var customHeadline = _a.customHeadline, customHeroBody = _a.customHeroBody;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _b = (0, useResponsiveLayout_1.default)(), isMediumScreenWidth = _b.isMediumScreenWidth, isLargeScreenWidth = _b.isLargeScreenWidth;
    var translate = (0, useLocalize_1.default)().translate;
    return (<react_native_1.View style={[styles.flex1, styles.alignSelfCenter, styles.gap7]}>
            <Text_1.default style={[
            styles.loginHeroHeader,
            isMediumScreenWidth && StyleUtils.getFontSizeStyle(variables_1.default.fontSizeSignInHeroMedium),
            isLargeScreenWidth && StyleUtils.getFontSizeStyle(variables_1.default.fontSizeSignInHeroLarge),
        ]}>
                {customHeadline !== null && customHeadline !== void 0 ? customHeadline : translate('login.hero.header')}
            </Text_1.default>
            <Text_1.default style={[styles.loginHeroBody]}>{customHeroBody !== null && customHeroBody !== void 0 ? customHeroBody : translate('login.hero.body')}</Text_1.default>
        </react_native_1.View>);
}
SignInHeroCopy.displayName = 'SignInHeroCopy';
exports.default = SignInHeroCopy;

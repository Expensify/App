"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function DeeplinkRedirectLoadingIndicator(_a) {
    var openLinkInBrowser = _a.openLinkInBrowser;
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var currentUserLogin = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { selector: function (session) { return session === null || session === void 0 ? void 0 : session.email; } })[0];
    return (<react_native_1.View style={styles.deeplinkWrapperContainer}>
            <react_native_1.View style={styles.deeplinkWrapperMessage}>
                <react_native_1.View style={styles.mb2}>
                    <Icon_1.default width={200} height={164} src={Illustrations.RocketBlue}/>
                </react_native_1.View>
                <Text_1.default style={[styles.textHeadline, styles.textXXLarge]}>{translate('deeplinkWrapper.launching')}</Text_1.default>
                <react_native_1.View style={[styles.mt2, styles.textAlignCenter]}>
                    <Text_1.default>{translate('deeplinkWrapper.loggedInAs', { email: currentUserLogin !== null && currentUserLogin !== void 0 ? currentUserLogin : '' })}</Text_1.default>
                    <Text_1.default style={[styles.textAlignCenter]}>
                        {translate('deeplinkWrapper.doNotSeePrompt')} <TextLink_1.default onPress={function () { return openLinkInBrowser(true); }}>{translate('deeplinkWrapper.tryAgain')}</TextLink_1.default>
                        {translate('deeplinkWrapper.or')} <TextLink_1.default onPress={function () { return Navigation_1.default.goBack(); }}>{translate('deeplinkWrapper.continueInWeb')}</TextLink_1.default>.
                    </Text_1.default>
                </react_native_1.View>
            </react_native_1.View>
            <react_native_1.View style={styles.deeplinkWrapperFooter}>
                <Icon_1.default width={154} height={34} fill={theme.success} src={Expensicons.ExpensifyWordmark}/>
            </react_native_1.View>
        </react_native_1.View>);
}
DeeplinkRedirectLoadingIndicator.displayName = 'DeeplinkRedirectLoadingIndicator';
exports.default = DeeplinkRedirectLoadingIndicator;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var react_native_safe_area_context_1 = require("react-native-safe-area-context");
var AppleSignIn_1 = require("@components/SignInButtons/AppleSignIn");
var GoogleSignIn_1 = require("@components/SignInButtons/GoogleSignIn");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SignInPageLayout_1 = require("./SignInPageLayout");
/* Dedicated screen that the desktop app links to on the web app, as Apple/Google
 * sign-in cannot work fully within Electron, so we escape to web and redirect
 * to desktop once we have an Expensify auth token.
 */
function ThirdPartySignInPage(_a) {
    var account = _a.account, signInProvider = _a.signInProvider;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var goBack = function () {
        Navigation_1.default.navigate(ROUTES_1.default.HOME);
    };
    return (<react_native_safe_area_context_1.SafeAreaView style={[styles.signInPage]}>
            {(account === null || account === void 0 ? void 0 : account.isLoading) ? (<react_native_1.View style={styles.thirdPartyLoadingContainer}>
                    <react_native_1.ActivityIndicator size="large"/>
                </react_native_1.View>) : (<SignInPageLayout_1.default welcomeHeader={translate('welcomeText.getStarted')} shouldShowWelcomeHeader>
                    {signInProvider === CONST_1.default.SIGN_IN_METHOD.APPLE ? <AppleSignIn_1.default isDesktopFlow/> : <GoogleSignIn_1.default isDesktopFlow/>}
                    <Text_1.default style={[styles.mt5]}>{translate('thirdPartySignIn.redirectToDesktopMessage')}</Text_1.default>
                    <Text_1.default style={[styles.mt5]}>{translate('thirdPartySignIn.goBackMessage', { provider: signInProvider })}</Text_1.default>
                    <TextLink_1.default style={[styles.link]} onPress={goBack}>
                        {translate('common.goBack')}.
                    </TextLink_1.default>
                    <Text_1.default style={[styles.textExtraSmallSupporting, styles.mt5, styles.mb5]}>
                        {translate('thirdPartySignIn.signInAgreementMessage')}
                        <TextLink_1.default style={[styles.textExtraSmallSupporting, styles.link]} href="">
                            {" ".concat(translate('common.termsOfService'))}
                        </TextLink_1.default>
                        {" ".concat(translate('common.and'), " ")}
                        <TextLink_1.default style={[styles.textExtraSmallSupporting, styles.link]} href="">
                            {translate('common.privacy')}
                        </TextLink_1.default>
                        .
                    </Text_1.default>
                </SignInPageLayout_1.default>)}
        </react_native_safe_area_context_1.SafeAreaView>);
}
ThirdPartySignInPage.displayName = 'ThirdPartySignInPage';
exports.default = (0, react_native_onyx_1.withOnyx)({
    account: {
        key: ONYXKEYS_1.default.ACCOUNT,
    },
})(ThirdPartySignInPage);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var Button_1 = require("@components/Button");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var Text_1 = require("@components/Text");
var useKeyboardState_1 = require("@hooks/useKeyboardState");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Session = require("@userActions/Session");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var ChangeExpensifyLoginLink_1 = require("./ChangeExpensifyLoginLink");
var Terms_1 = require("./Terms");
function ChooseSSOOrMagicCode(_a) {
    var credentials = _a.credentials, account = _a.account, setIsUsingMagicCode = _a.setIsUsingMagicCode;
    var styles = (0, useThemeStyles_1.default)();
    var isKeyboardShown = (0, useKeyboardState_1.default)().isKeyboardShown;
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    // This view doesn't have a field for user input, so dismiss the device keyboard if shown
    (0, react_1.useEffect)(function () {
        if (!isKeyboardShown) {
            return;
        }
        react_native_1.Keyboard.dismiss();
    }, [isKeyboardShown]);
    return (<>
            <react_native_1.View>
                <Text_1.default style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !shouldUseNarrowLayout ? styles.textAlignLeft : {}]}>{translate('samlSignIn.welcomeSAMLEnabled')}</Text_1.default>
                <Button_1.default isDisabled={isOffline} success large style={[styles.mv3]} text={translate('samlSignIn.useSingleSignOn')} isLoading={account === null || account === void 0 ? void 0 : account.isLoading} onPress={function () {
            Navigation_1.default.navigate(ROUTES_1.default.SAML_SIGN_IN);
        }}/>

                <react_native_1.View style={[styles.mt5]}>
                    <Text_1.default style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !shouldUseNarrowLayout ? styles.textAlignLeft : {}]}>
                        {translate('samlSignIn.orContinueWithMagicCode')}
                    </Text_1.default>
                </react_native_1.View>

                <Button_1.default isDisabled={isOffline} style={[styles.mv3]} large text={translate('samlSignIn.useMagicCode')} isLoading={(account === null || account === void 0 ? void 0 : account.isLoading) && (account === null || account === void 0 ? void 0 : account.loadingForm) === ((account === null || account === void 0 ? void 0 : account.requiresTwoFactorAuth) ? CONST_1.default.FORMS.VALIDATE_TFA_CODE_FORM : CONST_1.default.FORMS.VALIDATE_CODE_FORM)} onPress={function () {
            Session.resendValidateCode(credentials === null || credentials === void 0 ? void 0 : credentials.login);
            setIsUsingMagicCode(true);
        }}/>
                {!!account && !(0, EmptyObject_1.isEmptyObject)(account.errors) && <FormHelpMessage_1.default message={ErrorUtils.getLatestErrorMessage(account)}/>}
                <ChangeExpensifyLoginLink_1.default onPress={function () { return Session.clearSignInData(); }}/>
            </react_native_1.View>
            <react_native_1.View style={[styles.mt5, styles.signInPageWelcomeTextContainer]}>
                <Terms_1.default />
            </react_native_1.View>
        </>);
}
ChooseSSOOrMagicCode.displayName = 'ChooseSSOOrMagicCode';
exports.default = (0, react_native_onyx_1.withOnyx)({
    credentials: { key: ONYXKEYS_1.default.CREDENTIALS },
    account: { key: ONYXKEYS_1.default.ACCOUNT },
})(ChooseSSOOrMagicCode);

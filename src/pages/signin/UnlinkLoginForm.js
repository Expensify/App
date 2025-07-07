"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var Button_1 = require("@components/Button");
var DotIndicatorMessage_1 = require("@components/DotIndicatorMessage");
var PressableWithFeedback_1 = require("@components/Pressable/PressableWithFeedback");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils = require("@libs/ErrorUtils");
var Session = require("@userActions/Session");
var SignInRedirect_1 = require("@userActions/SignInRedirect");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function UnlinkLoginForm(_a) {
    var account = _a.account, credentials = _a.credentials;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var unlinkMessage = (account === null || account === void 0 ? void 0 : account.message) === 'unlinkLoginForm.linkSent' || (account === null || account === void 0 ? void 0 : account.message) === 'unlinkLoginForm.successfullyUnlinkedLogin' ? translate(account === null || account === void 0 ? void 0 : account.message) : account === null || account === void 0 ? void 0 : account.message;
    var primaryLogin = (0, react_1.useMemo)(function () {
        if (!(account === null || account === void 0 ? void 0 : account.primaryLogin)) {
            return '';
        }
        return expensify_common_1.Str.isSMSLogin(account.primaryLogin) ? expensify_common_1.Str.removeSMSDomain(account.primaryLogin) : account.primaryLogin;
    }, [account === null || account === void 0 ? void 0 : account.primaryLogin]);
    var secondaryLogin = (0, react_1.useMemo)(function () {
        if (!(credentials === null || credentials === void 0 ? void 0 : credentials.login)) {
            return '';
        }
        return expensify_common_1.Str.isSMSLogin(credentials.login) ? expensify_common_1.Str.removeSMSDomain(credentials.login) : credentials.login;
    }, [credentials === null || credentials === void 0 ? void 0 : credentials.login]);
    return (<>
            <react_native_1.View style={[styles.mt5]}>
                <Text_1.default>{translate('unlinkLoginForm.toValidateLogin', { primaryLogin: primaryLogin, secondaryLogin: secondaryLogin })}</Text_1.default>
            </react_native_1.View>
            <react_native_1.View style={[styles.mv5]}>
                <Text_1.default>{translate('unlinkLoginForm.noLongerHaveAccess', { primaryLogin: primaryLogin })}</Text_1.default>
            </react_native_1.View>
            {!!unlinkMessage && (
        // DotIndicatorMessage mostly expects onyxData errors, so we need to mock an object so that the messages looks similar to prop.account.errors
        <DotIndicatorMessage_1.default style={[styles.mb5, styles.flex0]} type="success" 
        // eslint-disable-next-line @typescript-eslint/naming-convention
        messages={{ 0: unlinkMessage }}/>)}
            {!!(account === null || account === void 0 ? void 0 : account.errors) && !(0, EmptyObject_1.isEmptyObject)(account.errors) && (<DotIndicatorMessage_1.default style={[styles.mb5]} type="error" messages={ErrorUtils.getErrorsWithTranslationData(account.errors)}/>)}
            <react_native_1.View style={[styles.mb4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                <PressableWithFeedback_1.default accessibilityLabel={translate('common.back')} onPress={function () { return (0, SignInRedirect_1.default)(); }}>
                    <Text_1.default style={[styles.link]}>{translate('common.back')}</Text_1.default>
                </PressableWithFeedback_1.default>
                <Button_1.default success text={translate('unlinkLoginForm.unlink')} isLoading={(account === null || account === void 0 ? void 0 : account.isLoading) && account.loadingForm === CONST_1.default.FORMS.UNLINK_LOGIN_FORM} onPress={function () { return Session.requestUnlinkValidationLink(); }} isDisabled={!!isOffline || !!(account === null || account === void 0 ? void 0 : account.message)}/>
            </react_native_1.View>
        </>);
}
UnlinkLoginForm.displayName = 'UnlinkLoginForm';
exports.default = (0, react_native_onyx_1.withOnyx)({
    credentials: { key: ONYXKEYS_1.default.CREDENTIALS },
    account: { key: ONYXKEYS_1.default.ACCOUNT },
})(UnlinkLoginForm);

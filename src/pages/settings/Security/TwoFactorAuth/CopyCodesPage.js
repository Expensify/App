"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var FixedFooter_1 = require("@components/FixedFooter");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var PressableWithDelayToggle_1 = require("@components/Pressable/PressableWithDelayToggle");
var ScrollView_1 = require("@components/ScrollView");
var Section_1 = require("@components/Section");
var Text_1 = require("@components/Text");
var ValidateCodeActionModal_1 = require("@components/ValidateCodeActionModal");
var useBeforeRemove_1 = require("@hooks/useBeforeRemove");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var types_1 = require("@libs/API/types");
var Clipboard_1 = require("@libs/Clipboard");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var localFileDownload_1 = require("@libs/localFileDownload");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Session_1 = require("@userActions/Session");
var TwoFactorAuthActions_1 = require("@userActions/TwoFactorAuthActions");
var User_1 = require("@userActions/User");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var TwoFactorAuthWrapper_1 = require("./TwoFactorAuthWrapper");
function CopyCodesPage(_a) {
    var _b, _c, _d, _e;
    var route = _a.route;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use correct style
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _f = (0, useResponsiveLayout_1.default)(), isExtraSmallScreenWidth = _f.isExtraSmallScreenWidth, isSmallScreenWidth = _f.isSmallScreenWidth;
    var _g = (0, react_1.useState)(''), error = _g[0], setError = _g[1];
    var _h = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true }), account = _h[0], accountMetadata = _h[1];
    var loginList = (0, useOnyx_1.default)(ONYXKEYS_1.default.LOGIN_LIST, { canBeMissing: true })[0];
    var isUserValidated = (_b = account === null || account === void 0 ? void 0 : account.validated) !== null && _b !== void 0 ? _b : false;
    var contactMethod = (_c = account === null || account === void 0 ? void 0 : account.primaryLogin) !== null && _c !== void 0 ? _c : '';
    var loginData = (0, react_1.useMemo)(function () { return loginList === null || loginList === void 0 ? void 0 : loginList[contactMethod]; }, [loginList, contactMethod]);
    var validateLoginError = (0, ErrorUtils_1.getEarliestErrorField)(loginData, 'validateLogin');
    var _j = (0, react_1.useState)(!isUserValidated), isValidateModalVisible = _j[0], setIsValidateModalVisible = _j[1];
    (0, react_1.useEffect)(function () {
        setIsValidateModalVisible(!isUserValidated);
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if ((0, isLoadingOnyxValue_1.default)(accountMetadata) || (account === null || account === void 0 ? void 0 : account.requiresTwoFactorAuth) || (account === null || account === void 0 ? void 0 : account.recoveryCodes) || !isUserValidated) {
            return;
        }
        (0, Session_1.toggleTwoFactorAuth)(true);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- We want to run this when component mounts
    }, [isUserValidated, accountMetadata.status]);
    (0, useBeforeRemove_1.default)(function () { return setIsValidateModalVisible(false); });
    return (<TwoFactorAuthWrapper_1.default title={translate('twoFactorAuth.headerTitle')} stepCounter={{
            step: 1,
            text: translate('twoFactorAuth.stepCodes'),
            total: 3,
        }} shouldEnableKeyboardAvoidingView={false} stepName={CONST_1.default.TWO_FACTOR_AUTH_STEPS.COPY_CODES} 
    // When the 2FA code step is open from Xero flow, we don't need to pass backTo because we build the necessary root route
    // from the backTo param in the route (in getMatchingRootRouteForRHPRoute) and goBack will not need a fallbackRoute.
    onBackButtonPress={function () { var _a, _b, _c; return (0, TwoFactorAuthActions_1.quitAndNavigateBack)(((_b = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.forwardTo) === null || _b === void 0 ? void 0 : _b.includes(types_1.READ_COMMANDS.CONNECT_POLICY_TO_XERO)) ? undefined : (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.backTo); }}>
            <ScrollView_1.default contentContainerStyle={styles.flexGrow1}>
                {!!isUserValidated && (<Section_1.default title={translate('twoFactorAuth.keepCodesSafe')} icon={Illustrations.ShieldYellow} containerStyles={[styles.twoFactorAuthSection]} iconContainerStyles={[styles.ml6]}>
                        <react_native_1.View style={styles.mv3}>
                            <Text_1.default>{translate('twoFactorAuth.codesLoseAccess')}</Text_1.default>
                        </react_native_1.View>
                        <react_native_1.View style={styles.twoFactorAuthCodesBox({ isExtraSmallScreenWidth: isExtraSmallScreenWidth, isSmallScreenWidth: isSmallScreenWidth })}>
                            {(account === null || account === void 0 ? void 0 : account.isLoading) ? (<react_native_1.View style={styles.twoFactorLoadingContainer}>
                                    <react_native_1.ActivityIndicator color={theme.spinner}/>
                                </react_native_1.View>) : (<>
                                    <react_native_1.View style={styles.twoFactorAuthCodesContainer}>
                                        {!!(account === null || account === void 0 ? void 0 : account.recoveryCodes) &&
                    ((_d = account === null || account === void 0 ? void 0 : account.recoveryCodes) === null || _d === void 0 ? void 0 : _d.split(', ').map(function (code) { return (<Text_1.default style={styles.twoFactorAuthCode} key={code}>
                                                    {code}
                                                </Text_1.default>); }))}
                                    </react_native_1.View>
                                    <react_native_1.View style={styles.twoFactorAuthCodesButtonsContainer}>
                                        <PressableWithDelayToggle_1.default text={translate('twoFactorAuth.copy')} textChecked={translate('common.copied')} icon={Expensicons.Copy} inline={false} onPress={function () {
                    var _a;
                    Clipboard_1.default.setString((_a = account === null || account === void 0 ? void 0 : account.recoveryCodes) !== null && _a !== void 0 ? _a : '');
                    setError('');
                    (0, TwoFactorAuthActions_1.setCodesAreCopied)();
                }} styles={[styles.button, styles.buttonMedium, styles.twoFactorAuthCodesButton]} textStyles={[styles.buttonMediumText]} accessible={false} tooltipText="" tooltipTextChecked=""/>
                                        <PressableWithDelayToggle_1.default text={translate('common.download')} icon={Expensicons.Download} onPress={function () {
                    var _a;
                    (0, localFileDownload_1.default)('two-factor-auth-codes', (_a = account === null || account === void 0 ? void 0 : account.recoveryCodes) !== null && _a !== void 0 ? _a : '');
                    setError('');
                    (0, TwoFactorAuthActions_1.setCodesAreCopied)();
                }} inline={false} styles={[styles.button, styles.buttonMedium, styles.twoFactorAuthCodesButton]} textStyles={[styles.buttonMediumText]} accessible={false} tooltipText="" tooltipTextChecked=""/>
                                    </react_native_1.View>
                                </>)}
                        </react_native_1.View>
                    </Section_1.default>)}
                <FixedFooter_1.default style={[styles.mtAuto, styles.pt5]}>
                    {!!error && (<FormHelpMessage_1.default isError message={error} style={[styles.mb3]}/>)}
                    <Button_1.default success large isDisabled={!isUserValidated} text={translate('common.next')} onPress={function () {
            var _a, _b;
            if (!(account === null || account === void 0 ? void 0 : account.codesAreCopied)) {
                return setError(translate('twoFactorAuth.errorStepCodes'));
            }
            Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_2FA_VERIFY.getRoute((_a = route.params) === null || _a === void 0 ? void 0 : _a.backTo, (_b = route.params) === null || _b === void 0 ? void 0 : _b.forwardTo));
        }}/>
                </FixedFooter_1.default>
            </ScrollView_1.default>
            <ValidateCodeActionModal_1.default title={translate('contacts.validateAccount')} descriptionPrimary={translate('contacts.featureRequiresValidate')} descriptionSecondary={translate('contacts.enterMagicCode', { contactMethod: contactMethod })} isVisible={isValidateModalVisible} validateCodeActionErrorField="validateLogin" validatePendingAction={(_e = loginData === null || loginData === void 0 ? void 0 : loginData.pendingFields) === null || _e === void 0 ? void 0 : _e.validateCodeSent} sendValidateCode={function () { return (0, User_1.requestValidateCodeAction)(); }} handleSubmitForm={function (validateCode) { return (0, User_1.validateSecondaryLogin)(loginList, contactMethod, validateCode, true); }} validateError={!(0, EmptyObject_1.isEmptyObject)(validateLoginError) ? validateLoginError : (0, ErrorUtils_1.getLatestErrorField)(loginData, 'validateCodeSent')} clearError={function () { return (0, User_1.clearContactMethodErrors)(contactMethod, !(0, EmptyObject_1.isEmptyObject)(validateLoginError) ? 'validateLogin' : 'validateCodeSent'); }} onModalHide={function () { }} onClose={function () {
            setIsValidateModalVisible(false);
            (0, TwoFactorAuthActions_1.quitAndNavigateBack)();
        }}/>
        </TwoFactorAuthWrapper_1.default>);
}
CopyCodesPage.displayName = 'CopyCodesPage';
exports.default = CopyCodesPage;

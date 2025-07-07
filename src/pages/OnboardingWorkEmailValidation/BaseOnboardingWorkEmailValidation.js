"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Button_1 = require("@components/Button");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Illustrations = require("@components/Icon/Illustrations");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var ValidateCodeForm_1 = require("@components/ValidateCodeActionModal/ValidateCodeForm");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var AccountUtils_1 = require("@libs/AccountUtils");
var Link_1 = require("@libs/actions/Link");
var Welcome_1 = require("@libs/actions/Welcome");
var Navigation_1 = require("@libs/Navigation/Navigation");
var variables_1 = require("@styles/variables");
var Session_1 = require("@userActions/Session");
var User_1 = require("@userActions/User");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function BaseOnboardingWorkEmailValidation(_a) {
    var shouldUseNativeStyles = _a.shouldUseNativeStyles;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: true })[0];
    var credentials = (0, useOnyx_1.default)(ONYXKEYS_1.default.CREDENTIALS, { canBeMissing: true })[0];
    var onboardingEmail = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.ONBOARDING_WORK_EMAIL_FORM, { canBeMissing: true })[0];
    var workEmail = onboardingEmail === null || onboardingEmail === void 0 ? void 0 : onboardingEmail.onboardingWorkEmail;
    var onboardingIsMediumOrLargerScreenWidth = (0, useResponsiveLayout_1.default)().onboardingIsMediumOrLargerScreenWidth;
    var onboardingValues = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ONBOARDING, { canBeMissing: true })[0];
    var isVsb = onboardingValues && 'signupQualifier' in onboardingValues && onboardingValues.signupQualifier === CONST_1.default.ONBOARDING_SIGNUP_QUALIFIERS.VSB;
    var isSmb = (onboardingValues === null || onboardingValues === void 0 ? void 0 : onboardingValues.signupQualifier) === CONST_1.default.ONBOARDING_SIGNUP_QUALIFIERS.SMB;
    var onboardingErrorMessage = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_ERROR_MESSAGE, { canBeMissing: true })[0];
    var isValidateCodeFormSubmitting = AccountUtils_1.default.isValidateCodeFormSubmitting(account);
    var isFocused = (0, native_1.useIsFocused)();
    (0, react_1.useEffect)(function () {
        if ((onboardingValues === null || onboardingValues === void 0 ? void 0 : onboardingValues.isMergeAccountStepCompleted) === undefined) {
            return;
        }
        (0, Welcome_1.setOnboardingErrorMessage)('');
        if (onboardingValues === null || onboardingValues === void 0 ? void 0 : onboardingValues.shouldRedirectToClassicAfterMerge) {
            (0, Link_1.openOldDotLink)(CONST_1.default.OLDDOT_URLS.INBOX, true);
            return;
        }
        // Once we verify that shouldValidate is false, we need to force replace the screen
        // so that we don't navigate back on back button press
        if (isVsb) {
            Navigation_1.default.navigate(ROUTES_1.default.ONBOARDING_ACCOUNTING.getRoute(), { forceReplace: true });
            return;
        }
        if (isSmb) {
            Navigation_1.default.navigate(ROUTES_1.default.ONBOARDING_EMPLOYEES.getRoute(), { forceReplace: true });
            return;
        }
        if (!(onboardingValues === null || onboardingValues === void 0 ? void 0 : onboardingValues.isMergeAccountStepSkipped)) {
            Navigation_1.default.navigate(ROUTES_1.default.ONBOARDING_WORKSPACES.getRoute(), { forceReplace: true });
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.ONBOARDING_PURPOSE.getRoute(), { forceReplace: true });
    }, [onboardingValues, isVsb, isSmb, isFocused]);
    var sendValidateCode = (0, react_1.useCallback)(function () {
        if (!(credentials === null || credentials === void 0 ? void 0 : credentials.login)) {
            return;
        }
        (0, User_1.resendValidateCode)(credentials.login);
    }, [credentials === null || credentials === void 0 ? void 0 : credentials.login]);
    var validateAccountAndMerge = (0, react_1.useCallback)(function (validateCode) {
        (0, Welcome_1.setOnboardingErrorMessage)('');
        (0, Session_1.MergeIntoAccountAndLogin)(workEmail, validateCode, session === null || session === void 0 ? void 0 : session.accountID);
    }, [workEmail, session === null || session === void 0 ? void 0 : session.accountID]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} testID="BaseOnboardingWorkEmailValidation" style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}>
            <HeaderWithBackButton_1.default shouldShowBackButton={!(onboardingValues === null || onboardingValues === void 0 ? void 0 : onboardingValues.isMergingAccountBlocked)} progressBarPercentage={15} onBackButtonPress={function () {
            (0, Welcome_1.updateOnboardingValuesAndNavigation)(onboardingValues);
        }}/>
            {(onboardingValues === null || onboardingValues === void 0 ? void 0 : onboardingValues.isMergingAccountBlocked) ? (<react_native_1.View style={[styles.flex1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                    <BlockingView_1.default icon={Illustrations.ToddBehindCloud} iconWidth={variables_1.default.modalTopIconWidth} iconHeight={variables_1.default.modalTopIconHeight} title={translate('onboarding.mergeBlockScreen.title')} subtitle={translate('onboarding.mergeBlockScreen.subtitle', { workEmail: workEmail })} subtitleStyle={[styles.colorMuted]}/>
                    <Button_1.default success={onboardingValues === null || onboardingValues === void 0 ? void 0 : onboardingValues.isMergingAccountBlocked} large style={[styles.mb5]} text={translate('common.buttonConfirm')} onPress={function () {
                (0, Welcome_1.setOnboardingErrorMessage)('');
                if (isVsb) {
                    Navigation_1.default.navigate(ROUTES_1.default.ONBOARDING_ACCOUNTING.getRoute());
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.ONBOARDING_PURPOSE.getRoute());
            }}/>
                </react_native_1.View>) : (<react_native_1.View style={[styles.flex1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                    <Text_1.default style={styles.textHeadlineH1}>{translate('onboarding.workEmailValidation.title')}</Text_1.default>
                    <Text_1.default style={[styles.textNormal, styles.colorMuted, styles.textAlignLeft, styles.mt5]}>{translate('onboarding.workEmailValidation.magicCodeSent', { workEmail: workEmail })}</Text_1.default>
                    <ValidateCodeForm_1.default handleSubmitForm={validateAccountAndMerge} sendValidateCode={sendValidateCode} validateCodeActionErrorField="mergeIntoAccountAndLogIn" clearError={function () { return (0, Welcome_1.setOnboardingErrorMessage)(''); }} buttonStyles={[styles.flex2, styles.justifyContentEnd, styles.mb5]} shouldShowSkipButton handleSkipButtonPress={function () {
                (0, Welcome_1.setOnboardingErrorMessage)('');
                (0, Welcome_1.setOnboardingMergeAccountStepValue)(true, true);
            }} isLoading={isValidateCodeFormSubmitting} validateError={onboardingErrorMessage ? { invalidCodeError: onboardingErrorMessage } : undefined}/>
                </react_native_1.View>)}
        </ScreenWrapper_1.default>);
}
BaseOnboardingWorkEmailValidation.displayName = 'BaseOnboardingWorkEmailValidation';
exports.default = BaseOnboardingWorkEmailValidation;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var AutoEmailLink_1 = require("@components/AutoEmailLink");
var Button_1 = require("@components/Button");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var Illustrations = require("@components/Icon/Illustrations");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var getOperatingSystem_1 = require("@libs/getOperatingSystem");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Session_1 = require("@userActions/Session");
var Welcome_1 = require("@userActions/Welcome");
var CONST_1 = require("@src/CONST");
var Log_1 = require("@src/libs/Log");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var OnboardingWorkEmailForm_1 = require("@src/types/form/OnboardingWorkEmailForm");
function BaseOnboardingWorkEmail(_a) {
    var shouldUseNativeStyles = _a.shouldUseNativeStyles;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var onboardingValues = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ONBOARDING, { canBeMissing: true })[0];
    var formValue = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.ONBOARDING_WORK_EMAIL_FORM, { canBeMissing: true })[0];
    var workEmail = formValue === null || formValue === void 0 ? void 0 : formValue[OnboardingWorkEmailForm_1.default.ONBOARDING_WORK_EMAIL];
    var onboardingErrorMessage = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_ERROR_MESSAGE, { canBeMissing: true })[0];
    var isVsb = onboardingValues && 'signupQualifier' in onboardingValues && onboardingValues.signupQualifier === CONST_1.default.ONBOARDING_SIGNUP_QUALIFIERS.VSB;
    var isSmb = (onboardingValues === null || onboardingValues === void 0 ? void 0 : onboardingValues.signupQualifier) === CONST_1.default.ONBOARDING_SIGNUP_QUALIFIERS.SMB;
    var onboardingIsMediumOrLargerScreenWidth = (0, useResponsiveLayout_1.default)().onboardingIsMediumOrLargerScreenWidth;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var _b = (0, react_1.useState)(false), shouldValidateOnChange = _b[0], setShouldValidateOnChange = _b[1];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var ICON_SIZE = 48;
    var operatingSystem = (0, getOperatingSystem_1.default)();
    var isFocused = (0, native_1.useIsFocused)();
    (0, react_1.useEffect)(function () {
        (0, Welcome_1.setOnboardingErrorMessage)('');
    }, []);
    (0, react_1.useEffect)(function () {
        if ((onboardingValues === null || onboardingValues === void 0 ? void 0 : onboardingValues.shouldValidate) === undefined && (onboardingValues === null || onboardingValues === void 0 ? void 0 : onboardingValues.isMergeAccountStepCompleted) === undefined) {
            return;
        }
        (0, Welcome_1.setOnboardingErrorMessage)('');
        if (onboardingValues === null || onboardingValues === void 0 ? void 0 : onboardingValues.shouldValidate) {
            Navigation_1.default.navigate(ROUTES_1.default.ONBOARDING_WORK_EMAIL_VALIDATION.getRoute());
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
            Navigation_1.default.navigate(ROUTES_1.default.ONBOARDING_PRIVATE_DOMAIN.getRoute(), { forceReplace: true });
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.ONBOARDING_PURPOSE.getRoute(), { forceReplace: true });
    }, [onboardingValues === null || onboardingValues === void 0 ? void 0 : onboardingValues.shouldValidate, isVsb, isSmb, isFocused, onboardingValues === null || onboardingValues === void 0 ? void 0 : onboardingValues.isMergeAccountStepCompleted, onboardingValues === null || onboardingValues === void 0 ? void 0 : onboardingValues.isMergeAccountStepSkipped]);
    var submitWorkEmail = (0, react_1.useCallback)(function (values) {
        (0, Session_1.AddWorkEmail)(values[OnboardingWorkEmailForm_1.default.ONBOARDING_WORK_EMAIL]);
    }, []);
    var validate = function (values) {
        var _a;
        if (!shouldValidateOnChange) {
            setShouldValidateOnChange(true);
        }
        var userEmail = values[OnboardingWorkEmailForm_1.default.ONBOARDING_WORK_EMAIL];
        var errors = {};
        var emailParts = userEmail.split('@');
        var domain = (_a = emailParts.at(1)) !== null && _a !== void 0 ? _a : '';
        if ((expensify_common_1.PUBLIC_DOMAINS_SET.has(domain.toLowerCase()) || !expensify_common_1.Str.isValidEmail(userEmail)) && !isOffline) {
            Log_1.default.hmmm('User is trying to add an invalid work email', { userEmail: userEmail, domain: domain });
            (0, ErrorUtils_1.addErrorMessage)(errors, OnboardingWorkEmailForm_1.default.ONBOARDING_WORK_EMAIL, translate('onboarding.workEmailValidationError.publicEmail'));
        }
        if (isOffline !== null && isOffline !== void 0 ? isOffline : false) {
            (0, ErrorUtils_1.addErrorMessage)(errors, OnboardingWorkEmailForm_1.default.ONBOARDING_WORK_EMAIL, translate('onboarding.workEmailValidationError.offline'));
        }
        return errors;
    };
    var section = [
        {
            icon: Illustrations.EnvelopeReceipt,
            titleTranslationKey: 'onboarding.workEmail.explanationModal.descriptionOne',
            shouldRenderEmail: true,
        },
        {
            icon: Illustrations.Profile,
            titleTranslationKey: 'onboarding.workEmail.explanationModal.descriptionTwo',
        },
        {
            icon: Illustrations.Gears,
            titleTranslationKey: 'onboarding.workEmail.explanationModal.descriptionThree',
        },
    ];
    return (<ScreenWrapper_1.default shouldEnableMaxHeight includeSafeAreaPaddingBottom={isOffline} testID="BaseOnboardingWorkEmail" style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}>
            <HeaderWithBackButton_1.default progressBarPercentage={10} shouldShowBackButton={false}/>
            <FormProvider_1.default style={[styles.flexGrow1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]} formID={ONYXKEYS_1.default.FORMS.ONBOARDING_WORK_EMAIL_FORM} validate={validate} onSubmit={submitWorkEmail} submitButtonText={translate('onboarding.workEmail.addWorkEmail')} enabledWhenOffline submitFlexEnabled shouldValidateOnBlur={false} shouldValidateOnChange={shouldValidateOnChange} shouldTrimValues={false} footerContent={<react_native_1.View style={styles.mb2}>
                        <OfflineWithFeedback_1.default shouldDisplayErrorAbove errors={onboardingErrorMessage ? { addWorkEmailError: onboardingErrorMessage } : undefined} errorRowStyles={[styles.mt2, styles.textWrap]} onClose={function () { return (0, Welcome_1.setOnboardingErrorMessage)(''); }}>
                            <Button_1.default large text={translate('common.skip')} testID="onboardingPrivateEmailSkipButton" onPress={function () {
                (0, Welcome_1.setOnboardingErrorMessage)('');
                (0, Welcome_1.setOnboardingMergeAccountStepValue)(true, true);
            }}/>
                        </OfflineWithFeedback_1.default>
                    </react_native_1.View>} shouldRenderFooterAboveSubmit shouldHideFixErrorsAlert>
                <react_native_1.View>
                    <react_native_1.View style={[onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb3]}>
                        <Text_1.default style={styles.textHeadlineH1}>{translate('onboarding.workEmail.title')}</Text_1.default>
                    </react_native_1.View>
                    <react_native_1.View style={styles.mb2}>
                        <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{translate('onboarding.workEmail.subtitle')}</Text_1.default>
                    </react_native_1.View>
                    <react_native_1.View>
                        {section.map(function (item) {
            return (<react_native_1.View key={item.titleTranslationKey} style={[styles.mt2, styles.mb3]}>
                                    <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
                                        <Icon_1.default src={item.icon} height={ICON_SIZE} width={ICON_SIZE} additionalStyles={[styles.mr3]}/>
                                        <react_native_1.View style={[styles.flexColumn, styles.flex1]}>
                                            {item.shouldRenderEmail ? (<AutoEmailLink_1.default style={[styles.textStrong, styles.lh20]} text={translate(item.titleTranslationKey)}/>) : (<Text_1.default style={[styles.textStrong, styles.lh20]}>{translate(item.titleTranslationKey)}</Text_1.default>)}
                                        </react_native_1.View>
                                    </react_native_1.View>
                                </react_native_1.View>);
        })}
                    </react_native_1.View>
                </react_native_1.View>

                <react_native_1.View style={[styles.mb4, styles.pt3]}>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} 
    // We do not want to auto-focus for mobile platforms
    ref={operatingSystem !== CONST_1.default.OS.ANDROID && operatingSystem !== CONST_1.default.OS.IOS ? inputCallbackRef : undefined} name="fname" inputID={OnboardingWorkEmailForm_1.default.ONBOARDING_WORK_EMAIL} label={translate('common.workEmail')} aria-label={translate('common.workEmail')} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={workEmail !== null && workEmail !== void 0 ? workEmail : ''} shouldSaveDraft maxLength={CONST_1.default.LOGIN_CHARACTER_LIMIT} spellCheck={false}/>
                </react_native_1.View>
            </FormProvider_1.default>
        </ScreenWrapper_1.default>);
}
BaseOnboardingWorkEmail.displayName = 'BaseOnboardingWorkEmail';
exports.default = BaseOnboardingWorkEmail;

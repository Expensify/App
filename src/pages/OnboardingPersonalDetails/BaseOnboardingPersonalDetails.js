"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var withCurrentUserPersonalDetails_1 = require("@components/withCurrentUserPersonalDetails");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnboardingMessages_1 = require("@hooks/useOnboardingMessages");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var navigateAfterOnboarding_1 = require("@libs/navigateAfterOnboarding");
var Navigation_1 = require("@libs/Navigation/Navigation");
var UserUtils_1 = require("@libs/UserUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var Onboarding_1 = require("@userActions/Onboarding");
var PersonalDetails_1 = require("@userActions/PersonalDetails");
var Report_1 = require("@userActions/Report");
var Welcome_1 = require("@userActions/Welcome");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var DisplayNameForm_1 = require("@src/types/form/DisplayNameForm");
function BaseOnboardingPersonalDetails(_a) {
    var _b;
    var currentUserPersonalDetails = _a.currentUserPersonalDetails, shouldUseNativeStyles = _a.shouldUseNativeStyles, route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var onboardingPurposeSelected = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_PURPOSE_SELECTED, { canBeMissing: true })[0];
    var onboardingPolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_POLICY_ID, { canBeMissing: true })[0];
    var onboardingAdminsChatReportID = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_ADMINS_CHAT_REPORT_ID, { canBeMissing: true })[0];
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var loginList = (0, useOnyx_1.default)(ONYXKEYS_1.default.LOGIN_LIST, { canBeMissing: true })[0];
    var onboardingValues = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ONBOARDING, { canBeMissing: true })[0];
    var conciergeChatReportID = (0, useOnyx_1.default)(ONYXKEYS_1.default.CONCIERGE_REPORT_ID, { canBeMissing: true })[0];
    var onboardingMessages = (0, useOnboardingMessages_1.default)().onboardingMessages;
    // When we merge public email with work email, we now want to navigate to the
    // concierge chat report of the new work email and not the last accessed report.
    var mergedAccountConciergeReportID = !(onboardingValues === null || onboardingValues === void 0 ? void 0 : onboardingValues.shouldRedirectToClassicAfterMerge) && (onboardingValues === null || onboardingValues === void 0 ? void 0 : onboardingValues.shouldValidate) ? conciergeChatReportID : undefined;
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _c = (0, useResponsiveLayout_1.default)(), onboardingIsMediumOrLargerScreenWidth = _c.onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth = _c.isSmallScreenWidth;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var _d = (0, react_1.useState)(false), shouldValidateOnChange = _d[0], setShouldValidateOnChange = _d[1];
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var isPrivateDomainAndHasAccessiblePolicies = !(account === null || account === void 0 ? void 0 : account.isFromPublicDomain) && !!(account === null || account === void 0 ? void 0 : account.hasAccessibleDomainPolicies);
    var isValidated = (0, UserUtils_1.isCurrentUserValidated)(loginList);
    (0, react_1.useEffect)(function () {
        (0, Welcome_1.setOnboardingErrorMessage)('');
    }, []);
    var completeOnboarding = (0, react_1.useCallback)(function (firstName, lastName) {
        if (!onboardingPurposeSelected) {
            return;
        }
        (0, Report_1.completeOnboarding)({
            engagementChoice: onboardingPurposeSelected,
            onboardingMessage: onboardingMessages[onboardingPurposeSelected],
            firstName: firstName,
            lastName: lastName,
            adminsChatReportID: onboardingAdminsChatReportID,
            onboardingPolicyID: onboardingPolicyID,
        });
        (0, Welcome_1.setOnboardingAdminsChatReportID)();
        (0, Welcome_1.setOnboardingPolicyID)();
        Navigation_1.default.setNavigationActionToMicrotaskQueue(function () {
            return (0, navigateAfterOnboarding_1.default)(isSmallScreenWidth, isBetaEnabled(CONST_1.default.BETAS.DEFAULT_ROOMS), onboardingPolicyID, mergedAccountConciergeReportID);
        });
    }, [onboardingPurposeSelected, onboardingAdminsChatReportID, onboardingMessages, onboardingPolicyID, isBetaEnabled, isSmallScreenWidth, mergedAccountConciergeReportID]);
    var handleSubmit = (0, react_1.useCallback)(function (values) {
        var _a, _b;
        var firstName = values.firstName.trim();
        var lastName = values.lastName.trim();
        (0, PersonalDetails_1.setDisplayName)(firstName, lastName);
        (0, Onboarding_1.clearPersonalDetailsDraft)();
        (0, Onboarding_1.setPersonalDetails)(firstName, lastName);
        if (isPrivateDomainAndHasAccessiblePolicies && !onboardingPurposeSelected) {
            var nextRoute = isValidated ? ROUTES_1.default.ONBOARDING_WORKSPACES : ROUTES_1.default.ONBOARDING_PRIVATE_DOMAIN;
            Navigation_1.default.navigate(nextRoute.getRoute((_a = route.params) === null || _a === void 0 ? void 0 : _a.backTo));
            return;
        }
        if (onboardingPurposeSelected === CONST_1.default.ONBOARDING_CHOICES.PERSONAL_SPEND || onboardingPurposeSelected === CONST_1.default.ONBOARDING_CHOICES.TRACK_WORKSPACE) {
            (0, PersonalDetails_1.updateDisplayName)(firstName, lastName);
            Navigation_1.default.navigate(ROUTES_1.default.ONBOARDING_WORKSPACE.getRoute((_b = route.params) === null || _b === void 0 ? void 0 : _b.backTo));
            return;
        }
        completeOnboarding(firstName, lastName);
    }, [isPrivateDomainAndHasAccessiblePolicies, onboardingPurposeSelected, isValidated, (_b = route.params) === null || _b === void 0 ? void 0 : _b.backTo, completeOnboarding]);
    var validate = function (values) {
        if (!shouldValidateOnChange) {
            setShouldValidateOnChange(true);
        }
        var errors = {};
        // First we validate the first name field
        if (values.firstName.replace(CONST_1.default.REGEX.ANY_SPACE, '').length === 0) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'firstName', translate('onboarding.error.requiredFirstName'));
        }
        if (!(0, ValidationUtils_1.isValidDisplayName)(values.firstName)) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'firstName', translate('personalDetails.error.hasInvalidCharacter'));
        }
        else if (values.firstName.length > CONST_1.default.DISPLAY_NAME.MAX_LENGTH) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'firstName', translate('common.error.characterLimitExceedCounter', { length: values.firstName.length, limit: CONST_1.default.DISPLAY_NAME.MAX_LENGTH }));
        }
        if ((0, ValidationUtils_1.doesContainReservedWord)(values.firstName, CONST_1.default.DISPLAY_NAME.RESERVED_NAMES)) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'firstName', translate('personalDetails.error.containsReservedWord'));
        }
        // Then we validate the last name field
        if (!(0, ValidationUtils_1.isValidDisplayName)(values.lastName)) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'lastName', translate('personalDetails.error.hasInvalidCharacter'));
        }
        else if (values.lastName.length > CONST_1.default.DISPLAY_NAME.MAX_LENGTH) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'lastName', translate('common.error.characterLimitExceedCounter', { length: values.lastName.length, limit: CONST_1.default.DISPLAY_NAME.MAX_LENGTH }));
        }
        if ((0, ValidationUtils_1.doesContainReservedWord)(values.lastName, CONST_1.default.DISPLAY_NAME.RESERVED_NAMES)) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'lastName', translate('personalDetails.error.containsReservedWord'));
        }
        return errors;
    };
    return (<ScreenWrapper_1.default shouldEnableMaxHeight includeSafeAreaPaddingBottom testID="BaseOnboardingPersonalDetails" style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}>
            <HeaderWithBackButton_1.default shouldShowBackButton={!isPrivateDomainAndHasAccessiblePolicies} progressBarPercentage={isPrivateDomainAndHasAccessiblePolicies ? 20 : 80} onBackButtonPress={Navigation_1.default.goBack}/>
            <FormProvider_1.default style={[styles.flexGrow1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]} formID={ONYXKEYS_1.default.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM} validate={validate} onSubmit={handleSubmit} submitButtonText={translate('common.continue')} enabledWhenOffline submitFlexEnabled shouldValidateOnBlur={false} shouldValidateOnChange={shouldValidateOnChange} shouldTrimValues={false}>
                <react_native_1.View style={[onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb5]}>
                    <Text_1.default style={styles.textHeadlineH1}>{translate('onboarding.whatsYourName')}</Text_1.default>
                </react_native_1.View>
                <react_native_1.View style={styles.mb4}>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} ref={inputCallbackRef} inputID={DisplayNameForm_1.default.FIRST_NAME} name="fname" label={translate('common.firstName')} aria-label={translate('common.firstName')} role={CONST_1.default.ROLE.PRESENTATION} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...((currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.firstName) && { defaultValue: currentUserPersonalDetails.firstName })} shouldSaveDraft spellCheck={false}/>
                </react_native_1.View>
                <react_native_1.View>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={DisplayNameForm_1.default.LAST_NAME} name="lname" label={translate('common.lastName')} aria-label={translate('common.lastName')} role={CONST_1.default.ROLE.PRESENTATION} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...((currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.lastName) && { defaultValue: currentUserPersonalDetails.lastName })} shouldSaveDraft spellCheck={false}/>
                </react_native_1.View>
            </FormProvider_1.default>
        </ScreenWrapper_1.default>);
}
BaseOnboardingPersonalDetails.displayName = 'BaseOnboardingPersonalDetails';
exports.default = (0, withCurrentUserPersonalDetails_1.default)(BaseOnboardingPersonalDetails);

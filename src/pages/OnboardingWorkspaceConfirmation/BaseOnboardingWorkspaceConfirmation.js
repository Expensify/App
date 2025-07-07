"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var Onboarding_1 = require("@userActions/Onboarding");
var Policy_1 = require("@userActions/Policy/Policy");
var Welcome_1 = require("@userActions/Welcome");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var WorkspaceConfirmationForm_1 = require("@src/types/form/WorkspaceConfirmationForm");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var OnboardingCurrencyPicker_1 = require("./OnboardingCurrencyPicker");
function BaseOnboardingWorkspaceConfirmation(_a) {
    var _b, _c, _d;
    var shouldUseNativeStyles = _a.shouldUseNativeStyles;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var onboardingPurposeSelected = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_PURPOSE_SELECTED, { canBeMissing: true })[0];
    var allPolicies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: true })[0];
    var onboardingPolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_POLICY_ID, { canBeMissing: true })[0];
    var onboardingAdminsChatReportID = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_ADMINS_CHAT_REPORT_ID, { canBeMissing: true })[0];
    var onboardingIsMediumOrLargerScreenWidth = (0, useResponsiveLayout_1.default)().onboardingIsMediumOrLargerScreenWidth;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var _e = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.ONBOARDING_WORKSPACE_DETAILS_FORM_DRAFT, { canBeMissing: true }), draftValues = _e[0], draftValuesMetadata = _e[1];
    var _f = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false }), session = _f[0], sessionMetadata = _f[1];
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var paidGroupPolicy = Object.values(allPolicies !== null && allPolicies !== void 0 ? allPolicies : {}).find(function (policy) { return (0, PolicyUtils_1.isPaidGroupPolicy)(policy) && (0, PolicyUtils_1.isPolicyAdmin)(policy, session === null || session === void 0 ? void 0 : session.email); });
    var defaultWorkspaceName = (_b = draftValues === null || draftValues === void 0 ? void 0 : draftValues.name) !== null && _b !== void 0 ? _b : (0, Policy_1.generateDefaultWorkspaceName)(session === null || session === void 0 ? void 0 : session.email);
    var defaultCurrency = (_d = (_c = draftValues === null || draftValues === void 0 ? void 0 : draftValues.currency) !== null && _c !== void 0 ? _c : currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.localCurrencyCode) !== null && _d !== void 0 ? _d : CONST_1.default.CURRENCY.USD;
    (0, react_1.useEffect)(function () {
        (0, Welcome_1.setOnboardingErrorMessage)('');
    }, []);
    var handleSubmit = (0, react_1.useCallback)(function (values) {
        if (!onboardingPurposeSelected) {
            return;
        }
        var shouldCreateWorkspace = !onboardingPolicyID && !paidGroupPolicy;
        var name = values.name.trim();
        var currency = values[WorkspaceConfirmationForm_1.default.CURRENCY];
        // We need `adminsChatReportID` for `completeOnboarding`, but at the same time, we don't want to call `createWorkspace` more than once.
        // If we have already created a workspace, we want to reuse the `onboardingAdminsChatReportID` and `onboardingPolicyID`.
        var _a = shouldCreateWorkspace
            ? (0, Policy_1.createWorkspace)(undefined, true, name, (0, Policy_1.generatePolicyID)(), CONST_1.default.ONBOARDING_CHOICES.TRACK_WORKSPACE, currency, undefined, false)
            : { adminsChatReportID: onboardingAdminsChatReportID, policyID: onboardingPolicyID }, adminsChatReportID = _a.adminsChatReportID, policyID = _a.policyID;
        if (shouldCreateWorkspace) {
            (0, Welcome_1.setOnboardingAdminsChatReportID)(adminsChatReportID);
            (0, Welcome_1.setOnboardingPolicyID)(policyID);
        }
        (0, Onboarding_1.clearWorkspaceDetailsDraft)();
        Navigation_1.default.navigate(ROUTES_1.default.ONBOARDING_WORKSPACE_INVITE.getRoute());
    }, [onboardingPurposeSelected, onboardingPolicyID, paidGroupPolicy, onboardingAdminsChatReportID]);
    var validate = function (values) {
        var errors = {};
        var name = values.name.trim();
        if (!(0, ValidationUtils_1.isRequiredFulfilled)(name)) {
            errors.name = translate('workspace.editor.nameIsRequiredError');
        }
        else if (__spreadArray([], name, true).length > CONST_1.default.TITLE_CHARACTER_LIMIT) {
            // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16
            // code units.
            (0, ErrorUtils_1.addErrorMessage)(errors, 'name', translate('common.error.characterLimitExceedCounter', { length: __spreadArray([], name, true).length, limit: CONST_1.default.TITLE_CHARACTER_LIMIT }));
        }
        if (!(0, ValidationUtils_1.isRequiredFulfilled)(values[WorkspaceConfirmationForm_1.default.CURRENCY])) {
            errors[WorkspaceConfirmationForm_1.default.CURRENCY] = translate('common.error.fieldRequired');
        }
        return errors;
    };
    if ((0, isLoadingOnyxValue_1.default)(draftValuesMetadata, sessionMetadata)) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<ScreenWrapper_1.default shouldEnableMaxHeight includeSafeAreaPaddingBottom testID={BaseOnboardingWorkspaceConfirmation.displayName} style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}>
            <HeaderWithBackButton_1.default progressBarPercentage={100}/>
            <FormProvider_1.default style={[styles.flexGrow1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]} formID={ONYXKEYS_1.default.FORMS.ONBOARDING_WORKSPACE_DETAILS_FORM} validate={validate} onSubmit={handleSubmit} submitButtonText={translate('common.continue')} enabledWhenOffline submitFlexEnabled shouldValidateOnBlur={false}>
                <react_native_1.View style={[onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb3]}>
                    <Text_1.default style={styles.textHeadlineH1}>{translate('onboarding.confirmWorkspace.title')}</Text_1.default>
                </react_native_1.View>
                <react_native_1.View style={styles.mb5}>
                    <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{translate('onboarding.confirmWorkspace.subtitle')}</Text_1.default>
                </react_native_1.View>
                <react_native_1.View style={styles.mb4}>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} ref={inputCallbackRef} inputID={WorkspaceConfirmationForm_1.default.NAME} label={translate('workspace.common.workspaceName')} accessibilityLabel={translate('workspace.common.workspaceName')} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={defaultWorkspaceName} shouldSaveDraft spellCheck={false}/>
                </react_native_1.View>
                <react_native_1.View style={[onboardingIsMediumOrLargerScreenWidth ? styles.mhn8 : styles.mhn5]}>
                    <InputWrapper_1.default InputComponent={OnboardingCurrencyPicker_1.default} inputID={WorkspaceConfirmationForm_1.default.CURRENCY} label={translate('workspace.editor.currencyInputLabel')} defaultValue={defaultCurrency} style={onboardingIsMediumOrLargerScreenWidth ? styles.ph8 : styles.ph5}/>
                </react_native_1.View>
            </FormProvider_1.default>
        </ScreenWrapper_1.default>);
}
BaseOnboardingWorkspaceConfirmation.displayName = 'BaseOnboardingWorkspaceConfirmation';
exports.default = BaseOnboardingWorkspaceConfirmation;

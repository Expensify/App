"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var CheckboxWithLabel_1 = require("@components/CheckboxWithLabel");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var getSubStepValues_1 = require("@pages/ReimbursementAccount/utils/getSubStepValues");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var _a = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY, AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT = _a.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT, PROVIDE_TRUTHFUL_INFORMATION = _a.PROVIDE_TRUTHFUL_INFORMATION, AGREE_TO_TERMS_AND_CONDITIONS = _a.AGREE_TO_TERMS_AND_CONDITIONS, CONSENT_TO_PRIVACY_NOTICE = _a.CONSENT_TO_PRIVACY_NOTICE;
var STEP_FIELDS = [AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT, PROVIDE_TRUTHFUL_INFORMATION, AGREE_TO_TERMS_AND_CONDITIONS, CONSENT_TO_PRIVACY_NOTICE];
function IsAuthorizedToUseBankAccountLabel() {
    var translate = (0, useLocalize_1.default)().translate;
    return <Text_1.default>{translate('agreementsStep.iAmAuthorized')}</Text_1.default>;
}
function CertifyTrueAndAccurateLabel() {
    var translate = (0, useLocalize_1.default)().translate;
    return <Text_1.default>{translate('agreementsStep.iCertify')}</Text_1.default>;
}
function TermsAndConditionsLabel() {
    var translate = (0, useLocalize_1.default)().translate;
    return (<Text_1.default>
            {translate('common.iAcceptThe')}
            <TextLink_1.default href="https://cross-border.corpay.com/tc/">{"".concat(translate('agreementsStep.termsAndConditions'))}</TextLink_1.default>.
        </Text_1.default>);
}
function ConsentToPrivacyNoticeLabel() {
    var translate = (0, useLocalize_1.default)().translate;
    return (<Text_1.default>
            {translate('agreementsStep.iConsentToThe')} <TextLink_1.default href="https://payments.corpay.com/compliance">{"".concat(translate('agreementsStep.privacyNotice'))}</TextLink_1.default>.
        </Text_1.default>);
}
var INPUT_KEYS = {
    PROVIDE_TRUTHFUL_INFORMATION: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.PROVIDE_TRUTHFUL_INFORMATION,
    AGREE_TO_TERMS_AND_CONDITIONS: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.AGREE_TO_TERMS_AND_CONDITIONS,
    CONSENT_TO_PRIVACY_NOTICE: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.CONSENT_TO_PRIVACY_NOTICE,
    AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT: ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT,
};
function Confirmation(_a) {
    var onNext = _a.onNext;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, { canBeMissing: false })[0];
    var agreementsStepValues = (0, react_1.useMemo)(function () { return (0, getSubStepValues_1.default)(INPUT_KEYS, reimbursementAccountDraft, reimbursementAccount); }, [reimbursementAccount, reimbursementAccountDraft]);
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, STEP_FIELDS);
        if (!(0, ValidationUtils_1.isRequiredFulfilled)(values[AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT])) {
            errors[AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT] = translate('agreementsStep.error.authorized');
        }
        if (!(0, ValidationUtils_1.isRequiredFulfilled)(values[PROVIDE_TRUTHFUL_INFORMATION])) {
            errors[PROVIDE_TRUTHFUL_INFORMATION] = translate('agreementsStep.error.certify');
        }
        if (!(0, ValidationUtils_1.isRequiredFulfilled)(values[AGREE_TO_TERMS_AND_CONDITIONS])) {
            errors[AGREE_TO_TERMS_AND_CONDITIONS] = translate('common.error.acceptTerms');
        }
        if (!(0, ValidationUtils_1.isRequiredFulfilled)(values[CONSENT_TO_PRIVACY_NOTICE])) {
            errors[CONSENT_TO_PRIVACY_NOTICE] = translate('agreementsStep.error.consent');
        }
        return errors;
    }, [translate]);
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} onSubmit={onNext} validate={validate} submitButtonText={translate('agreementsStep.accept')} style={[styles.mh5, styles.flexGrow1]} enabledWhenOffline={false} isLoading={reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.isFinishingCorpayBankAccountOnboarding}>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL]}>{translate('agreementsStep.pleaseConfirm')}</Text_1.default>
            <Text_1.default style={[styles.pv3, styles.textSupporting]}>{translate('agreementsStep.regulationRequiresUs')}</Text_1.default>
            <InputWrapper_1.default InputComponent={CheckboxWithLabel_1.default} accessibilityLabel={translate('agreementsStep.iAmAuthorized')} inputID={AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT} style={styles.mt6} LabelComponent={IsAuthorizedToUseBankAccountLabel} defaultValue={agreementsStepValues[AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT]} shouldSaveDraft/>
            <InputWrapper_1.default InputComponent={CheckboxWithLabel_1.default} accessibilityLabel={translate('agreementsStep.iCertify')} inputID={PROVIDE_TRUTHFUL_INFORMATION} style={styles.mt6} LabelComponent={CertifyTrueAndAccurateLabel} defaultValue={agreementsStepValues[PROVIDE_TRUTHFUL_INFORMATION]} shouldSaveDraft/>
            <InputWrapper_1.default InputComponent={CheckboxWithLabel_1.default} accessibilityLabel={"".concat(translate('common.iAcceptThe'), " ").concat(translate('agreementsStep.termsAndConditions'), ".")} inputID={AGREE_TO_TERMS_AND_CONDITIONS} style={styles.mt6} LabelComponent={TermsAndConditionsLabel} defaultValue={agreementsStepValues[AGREE_TO_TERMS_AND_CONDITIONS]} shouldSaveDraft/>
            <InputWrapper_1.default InputComponent={CheckboxWithLabel_1.default} accessibilityLabel={"".concat(translate('agreementsStep.iConsentToThe'), " ").concat(translate('agreementsStep.privacyNotice'), ".")} inputID={CONSENT_TO_PRIVACY_NOTICE} style={styles.mt6} LabelComponent={ConsentToPrivacyNoticeLabel} defaultValue={agreementsStepValues[CONSENT_TO_PRIVACY_NOTICE]} shouldSaveDraft/>
        </FormProvider_1.default>);
}
Confirmation.displayName = 'Confirmation';
exports.default = Confirmation;

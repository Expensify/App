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
var ValidationUtils = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var COMPLETE_VERIFICATION_KEYS = ReimbursementAccountForm_1.default.COMPLETE_VERIFICATION;
var STEP_FIELDS = [
    ReimbursementAccountForm_1.default.COMPLETE_VERIFICATION.IS_AUTHORIZED_TO_USE_BANK_ACCOUNT,
    ReimbursementAccountForm_1.default.COMPLETE_VERIFICATION.ACCEPT_TERMS_AND_CONDITIONS,
    ReimbursementAccountForm_1.default.COMPLETE_VERIFICATION.CERTIFY_TRUE_INFORMATION,
];
function IsAuthorizedToUseBankAccountLabel() {
    var translate = (0, useLocalize_1.default)().translate;
    return <Text_1.default>{translate('completeVerificationStep.isAuthorizedToUseBankAccount')}</Text_1.default>;
}
function CertifyTrueAndAccurateLabel() {
    var translate = (0, useLocalize_1.default)().translate;
    return <Text_1.default>{translate('completeVerificationStep.certifyTrueAndAccurate')}</Text_1.default>;
}
function TermsAndConditionsLabel() {
    var translate = (0, useLocalize_1.default)().translate;
    return (<Text_1.default>
            {translate('common.iAcceptThe')}
            <TextLink_1.default href={CONST_1.default.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}>{"".concat(translate('completeVerificationStep.termsAndConditions'))}</TextLink_1.default>
        </Text_1.default>);
}
function ConfirmAgreements(_a) {
    var _b, _c, _d, _e, _f, _g;
    var onNext = _a.onNext;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var defaultValues = {
        isAuthorizedToUseBankAccount: (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.isAuthorizedToUseBankAccount) !== null && _c !== void 0 ? _c : false,
        certifyTrueInformation: (_e = (_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _d === void 0 ? void 0 : _d.certifyTrueInformation) !== null && _e !== void 0 ? _e : false,
        acceptTermsAndConditions: (_g = (_f = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _f === void 0 ? void 0 : _f.acceptTermsAndConditions) !== null && _g !== void 0 ? _g : false,
    };
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);
        if (!ValidationUtils.isRequiredFulfilled(values.acceptTermsAndConditions)) {
            errors.acceptTermsAndConditions = translate('common.error.acceptTerms');
        }
        if (!ValidationUtils.isRequiredFulfilled(values.certifyTrueInformation)) {
            errors.certifyTrueInformation = translate('completeVerificationStep.certifyTrueAndAccurateError');
        }
        if (!ValidationUtils.isRequiredFulfilled(values.isAuthorizedToUseBankAccount)) {
            errors.isAuthorizedToUseBankAccount = translate('completeVerificationStep.isAuthorizedToUseBankAccountError');
        }
        return errors;
    }, [translate]);
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} validate={validate} onSubmit={onNext} submitButtonText={translate('common.saveAndContinue')} style={[styles.mh5, styles.flexGrow1]} enabledWhenOffline={false}>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL]}>{translate('completeVerificationStep.confirmAgreements')}</Text_1.default>
            <InputWrapper_1.default InputComponent={CheckboxWithLabel_1.default} accessibilityLabel={translate('completeVerificationStep.isAuthorizedToUseBankAccount')} inputID={COMPLETE_VERIFICATION_KEYS.IS_AUTHORIZED_TO_USE_BANK_ACCOUNT} style={styles.mt6} LabelComponent={IsAuthorizedToUseBankAccountLabel} defaultValue={defaultValues.isAuthorizedToUseBankAccount} shouldSaveDraft/>
            <InputWrapper_1.default InputComponent={CheckboxWithLabel_1.default} accessibilityLabel={translate('completeVerificationStep.certifyTrueAndAccurate')} inputID={COMPLETE_VERIFICATION_KEYS.CERTIFY_TRUE_INFORMATION} style={styles.mt6} LabelComponent={CertifyTrueAndAccurateLabel} defaultValue={defaultValues.certifyTrueInformation} shouldSaveDraft/>
            <InputWrapper_1.default InputComponent={CheckboxWithLabel_1.default} accessibilityLabel={"".concat(translate('common.iAcceptThe'), " ").concat(translate('completeVerificationStep.termsAndConditions'))} inputID={COMPLETE_VERIFICATION_KEYS.ACCEPT_TERMS_AND_CONDITIONS} style={styles.mt6} LabelComponent={TermsAndConditionsLabel} defaultValue={defaultValues.acceptTermsAndConditions} shouldSaveDraft/>
        </FormProvider_1.default>);
}
ConfirmAgreements.displayName = 'ConfirmAgreements';
exports.default = ConfirmAgreements;

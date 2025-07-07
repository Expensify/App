"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var FormActions_1 = require("@userActions/FormActions");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var _a = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY, BUSINESS_CONTACT_NUMBER = _a.BUSINESS_CONTACT_NUMBER, BUSINESS_CONFIRMATION_EMAIL = _a.BUSINESS_CONFIRMATION_EMAIL;
var STEP_FIELDS = [BUSINESS_CONTACT_NUMBER, BUSINESS_CONFIRMATION_EMAIL];
function ContactInformation(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var onNext = _a.onNext, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: false })[0];
    var primaryLogin = (_b = account === null || account === void 0 ? void 0 : account.primaryLogin) !== null && _b !== void 0 ? _b : '';
    var phoneNumberDefaultValue = (_e = (_d = (_c = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _c === void 0 ? void 0 : _c.corpay) === null || _d === void 0 ? void 0 : _d[BUSINESS_CONTACT_NUMBER]) !== null && _e !== void 0 ? _e : '';
    var confirmationEmailDefaultValue = (_j = (_h = (_g = (_f = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _f === void 0 ? void 0 : _f.corpay) === null || _g === void 0 ? void 0 : _g[BUSINESS_CONFIRMATION_EMAIL]) !== null && _h !== void 0 ? _h : primaryLogin) !== null && _j !== void 0 ? _j : '';
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, STEP_FIELDS);
        if (values[BUSINESS_CONTACT_NUMBER] && !(0, ValidationUtils_1.isValidPhoneInternational)(values[BUSINESS_CONTACT_NUMBER])) {
            errors[BUSINESS_CONTACT_NUMBER] = translate('common.error.phoneNumber');
        }
        if (values[BUSINESS_CONFIRMATION_EMAIL] && !(0, ValidationUtils_1.isValidEmail)(values[BUSINESS_CONFIRMATION_EMAIL])) {
            errors[BUSINESS_CONFIRMATION_EMAIL] = translate('common.error.email');
        }
        return errors;
    }, [translate]);
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: function (values) {
            var _a;
            (0, FormActions_1.setDraftValues)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM, (_a = {},
                _a[BUSINESS_CONFIRMATION_EMAIL] = values[BUSINESS_CONFIRMATION_EMAIL],
                _a));
            onNext();
        },
        shouldSaveDraft: true,
    });
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} onSubmit={handleSubmit} validate={validate} style={[styles.flexGrow1]} submitButtonStyles={[styles.mh5]}>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mh5, styles.mb3]}>{translate('businessInfoStep.whatsTheBusinessContactInformation')}</Text_1.default>
            <InputWrapper_1.default InputComponent={TextInput_1.default} label={translate('common.phoneNumber')} aria-label={translate('common.phoneNumber')} role={CONST_1.default.ROLE.PRESENTATION} inputMode={CONST_1.default.INPUT_MODE.TEL} inputID={BUSINESS_CONTACT_NUMBER} containerStyles={[styles.mt5, styles.mh5]} defaultValue={phoneNumberDefaultValue} shouldSaveDraft={!isEditing}/>
            <InputWrapper_1.default InputComponent={TextInput_1.default} label={translate('common.email')} aria-label={translate('common.email')} role={CONST_1.default.ROLE.PRESENTATION} inputMode={CONST_1.default.INPUT_MODE.EMAIL} inputID={BUSINESS_CONFIRMATION_EMAIL} containerStyles={[styles.mt5, styles.mh5]} defaultValue={confirmationEmailDefaultValue} shouldSaveDraft={!isEditing}/>
        </FormProvider_1.default>);
}
ContactInformation.displayName = 'ContactInformation';
exports.default = ContactInformation;

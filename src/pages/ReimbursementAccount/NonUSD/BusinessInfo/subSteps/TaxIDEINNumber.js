"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SingleFieldStep_1 = require("@components/SubStepForms/SingleFieldStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var _a = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY, TAX_ID_EIN_NUMBER = _a.TAX_ID_EIN_NUMBER, COMPANY_COUNTRY_CODE = _a.COMPANY_COUNTRY_CODE;
var STEP_FIELDS = [TAX_ID_EIN_NUMBER];
function TaxIDEINNumber(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false })[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, { canBeMissing: false })[0];
    var defaultValue = (_d = (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.corpay) === null || _c === void 0 ? void 0 : _c[TAX_ID_EIN_NUMBER]) !== null && _d !== void 0 ? _d : '';
    var businessStepCountryValue = (_h = (_g = (_f = (_e = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _e === void 0 ? void 0 : _e.corpay) === null || _f === void 0 ? void 0 : _f[COMPANY_COUNTRY_CODE]) !== null && _g !== void 0 ? _g : reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[COMPANY_COUNTRY_CODE]) !== null && _h !== void 0 ? _h : '';
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, STEP_FIELDS);
        if (values[TAX_ID_EIN_NUMBER] && !(0, ValidationUtils_1.isValidTaxIDEINNumber)(values[TAX_ID_EIN_NUMBER], businessStepCountryValue)) {
            errors[TAX_ID_EIN_NUMBER] = translate('businessInfoStep.error.taxIDEIN', { country: businessStepCountryValue });
        }
        return errors;
    }, [businessStepCountryValue, translate]);
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    return (<SingleFieldStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={translate('businessInfoStep.whatsTheBusinessTaxIDEIN', { country: businessStepCountryValue })} validate={validate} onSubmit={handleSubmit} inputId={TAX_ID_EIN_NUMBER} inputLabel={translate('businessInfoStep.taxIDEIN', { country: businessStepCountryValue })} defaultValue={defaultValue} shouldShowHelpLinks={false}/>);
}
TaxIDEINNumber.displayName = 'TaxIDEINNumber';
exports.default = TaxIDEINNumber;

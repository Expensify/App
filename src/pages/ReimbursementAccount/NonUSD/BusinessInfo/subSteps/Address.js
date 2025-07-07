"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AddressStep_1 = require("@components/SubStepForms/AddressStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var getSubStepValues_1 = require("@pages/ReimbursementAccount/utils/getSubStepValues");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var _a = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY, COMPANY_STREET = _a.COMPANY_STREET, COMPANY_POSTAL_CODE = _a.COMPANY_POSTAL_CODE, COMPANY_STATE = _a.COMPANY_STATE, COMPANY_CITY = _a.COMPANY_CITY, COMPANY_COUNTRY_CODE = _a.COMPANY_COUNTRY_CODE;
var INPUT_KEYS = {
    street: COMPANY_STREET,
    city: COMPANY_CITY,
    state: COMPANY_STATE,
    zipCode: COMPANY_POSTAL_CODE,
    country: COMPANY_COUNTRY_CODE,
};
var STEP_FIELDS = [COMPANY_STREET, COMPANY_CITY, COMPANY_STATE, COMPANY_POSTAL_CODE, COMPANY_COUNTRY_CODE];
var STEP_FIELDS_WITHOUT_STATE = [COMPANY_STREET, COMPANY_CITY, COMPANY_POSTAL_CODE, COMPANY_COUNTRY_CODE];
function Address(_a) {
    var _b, _c, _d, _e, _f, _g, _h;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var onyxValues = (0, react_1.useMemo)(function () { return (0, getSubStepValues_1.default)(INPUT_KEYS, reimbursementAccountDraft, reimbursementAccount); }, [reimbursementAccount, reimbursementAccountDraft]);
    var businessStepCountryDefaultValue = (_b = onyxValues[COMPANY_COUNTRY_CODE]) !== null && _b !== void 0 ? _b : '';
    var countryStepCountryValue = (_d = (_c = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _c === void 0 ? void 0 : _c[ReimbursementAccountForm_1.default.ADDITIONAL_DATA.COUNTRY]) !== null && _d !== void 0 ? _d : '';
    var countryDefaultValue = businessStepCountryDefaultValue === '' ? countryStepCountryValue : businessStepCountryDefaultValue;
    var shouldDisplayStateSelector = countryDefaultValue === CONST_1.default.COUNTRY.US || countryDefaultValue === CONST_1.default.COUNTRY.CA;
    var defaultValues = {
        street: (_e = onyxValues[COMPANY_STREET]) !== null && _e !== void 0 ? _e : '',
        city: (_f = onyxValues[COMPANY_CITY]) !== null && _f !== void 0 ? _f : '',
        state: (_g = onyxValues[COMPANY_STATE]) !== null && _g !== void 0 ? _g : '',
        zipCode: (_h = onyxValues[COMPANY_POSTAL_CODE]) !== null && _h !== void 0 ? _h : '',
        country: countryDefaultValue,
    };
    var stepFields = shouldDisplayStateSelector ? STEP_FIELDS : STEP_FIELDS_WITHOUT_STATE;
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: stepFields,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    return (<AddressStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={translate('businessInfoStep.whatsTheBusinessAddress')} formPOBoxDisclaimer={translate('common.noPO')} onSubmit={handleSubmit} stepFields={stepFields} inputFieldsIDs={INPUT_KEYS} defaultValues={defaultValues} shouldDisplayStateSelector={shouldDisplayStateSelector} shouldDisplayCountrySelector shouldAllowCountryChange={false} shouldValidateZipCodeFormat={countryDefaultValue === CONST_1.default.COUNTRY.US}/>);
}
Address.displayName = 'Address';
exports.default = Address;

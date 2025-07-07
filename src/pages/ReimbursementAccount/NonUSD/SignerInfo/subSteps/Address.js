"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AddressStep_1 = require("@components/SubStepForms/AddressStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var _a = CONST_1.default.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA, STREET = _a.STREET, CITY = _a.CITY, STATE = _a.STATE, ZIP_CODE = _a.ZIP_CODE, COUNTRY = _a.COUNTRY;
function Address(_a) {
    var _b, _c, _d, _e, _f;
    var onNext = _a.onNext, isEditing = _a.isEditing, onMove = _a.onMove;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, { canBeMissing: true })[0];
    var countryInputKey = COUNTRY;
    var inputKeys = {
        street: STREET,
        city: CITY,
        state: STATE,
        zipCode: ZIP_CODE,
        country: countryInputKey,
    };
    var defaultValues = {
        street: String((_b = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[inputKeys.street]) !== null && _b !== void 0 ? _b : ''),
        city: String((_c = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[inputKeys.city]) !== null && _c !== void 0 ? _c : ''),
        state: String((_d = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[inputKeys.state]) !== null && _d !== void 0 ? _d : ''),
        zipCode: String((_e = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[inputKeys.zipCode]) !== null && _e !== void 0 ? _e : ''),
        country: ((_f = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[inputKeys.country]) !== null && _f !== void 0 ? _f : ''),
    };
    var formTitle = translate('ownershipInfoStep.whatsYourAddress');
    // Has to be stored in state and updated on country change due to the fact that we can't relay on onyxValues when user is editing the form (draft values are not being saved in that case)
    var _g = (0, react_1.useState)(defaultValues.country === CONST_1.default.COUNTRY.US || defaultValues.country === CONST_1.default.COUNTRY.CA || defaultValues.country === ''), shouldDisplayStateSelector = _g[0], setShouldDisplayStateSelector = _g[1];
    var _h = (0, react_1.useState)(defaultValues.country === CONST_1.default.COUNTRY.US), shouldValidateZipCodeFormat = _h[0], setShouldValidateZipCodeFormat = _h[1];
    var stepFieldsWithState = (0, react_1.useMemo)(function () { return [inputKeys.street, inputKeys.city, inputKeys.state, inputKeys.zipCode, countryInputKey]; }, [countryInputKey, inputKeys.city, inputKeys.state, inputKeys.street, inputKeys.zipCode]);
    var stepFieldsWithoutState = (0, react_1.useMemo)(function () { return [inputKeys.street, inputKeys.city, inputKeys.zipCode, countryInputKey]; }, [countryInputKey, inputKeys.city, inputKeys.street, inputKeys.zipCode]);
    var stepFields = shouldDisplayStateSelector ? stepFieldsWithState : stepFieldsWithoutState;
    var handleCountryChange = function (country) {
        if (typeof country !== 'string' || country === '') {
            return;
        }
        setShouldDisplayStateSelector(country === CONST_1.default.COUNTRY.US || country === CONST_1.default.COUNTRY.CA);
        setShouldValidateZipCodeFormat(country === CONST_1.default.COUNTRY.US);
    };
    var handleNextStep = function () {
        // owner is US based we need to gather last four digits of his SSN
        if ((reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[inputKeys.country]) === CONST_1.default.COUNTRY.US) {
            onNext();
            // owner is not US based so we skip SSN step
        }
        else {
            onMove(4, false);
        }
    };
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: stepFields,
        onNext: handleNextStep,
        shouldSaveDraft: isEditing,
    });
    return (<AddressStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={formTitle} formPOBoxDisclaimer={translate('common.noPO')} onSubmit={handleSubmit} stepFields={stepFields} inputFieldsIDs={inputKeys} defaultValues={defaultValues} onCountryChange={handleCountryChange} shouldDisplayStateSelector={shouldDisplayStateSelector} shouldDisplayCountrySelector shouldValidateZipCodeFormat={shouldValidateZipCodeFormat}/>);
}
Address.displayName = 'Address';
exports.default = Address;

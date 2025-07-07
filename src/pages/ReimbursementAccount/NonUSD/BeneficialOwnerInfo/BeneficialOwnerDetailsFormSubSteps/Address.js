"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AddressStep_1 = require("@components/SubStepForms/AddressStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var _a = CONST_1.default.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA, STREET = _a.STREET, CITY = _a.CITY, STATE = _a.STATE, ZIP_CODE = _a.ZIP_CODE, COUNTRY = _a.COUNTRY, PREFIX = _a.PREFIX;
function Address(_a) {
    var _b, _c, _d, _e, _f, _g;
    var onNext = _a.onNext, isEditing = _a.isEditing, onMove = _a.onMove, isUserEnteringHisOwnData = _a.isUserEnteringHisOwnData, ownerBeingModifiedID = _a.ownerBeingModifiedID;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var countryStepCountryValue = (_b = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[ReimbursementAccountForm_1.default.ADDITIONAL_DATA.COUNTRY]) !== null && _b !== void 0 ? _b : '';
    var countryInputKey = "".concat(PREFIX, "_").concat(ownerBeingModifiedID, "_").concat(COUNTRY);
    var inputKeys = {
        street: "".concat(PREFIX, "_").concat(ownerBeingModifiedID, "_").concat(STREET),
        city: "".concat(PREFIX, "_").concat(ownerBeingModifiedID, "_").concat(CITY),
        state: "".concat(PREFIX, "_").concat(ownerBeingModifiedID, "_").concat(STATE),
        zipCode: "".concat(PREFIX, "_").concat(ownerBeingModifiedID, "_").concat(ZIP_CODE),
        country: countryInputKey,
    };
    var defaultValues = {
        street: String((_c = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[inputKeys.street]) !== null && _c !== void 0 ? _c : ''),
        city: String((_d = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[inputKeys.city]) !== null && _d !== void 0 ? _d : ''),
        state: String((_e = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[inputKeys.state]) !== null && _e !== void 0 ? _e : ''),
        zipCode: String((_f = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[inputKeys.zipCode]) !== null && _f !== void 0 ? _f : ''),
        country: ((_g = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[inputKeys.country]) !== null && _g !== void 0 ? _g : ''),
    };
    var formTitle = translate(isUserEnteringHisOwnData ? 'ownershipInfoStep.whatsYourAddress' : 'ownershipInfoStep.whatsTheOwnersAddress');
    // Has to be stored in state and updated on country change due to the fact that we can't relay on onyxValues when user is editing the form (draft values are not being saved in that case)
    var _h = (0, react_1.useState)(defaultValues.country === CONST_1.default.COUNTRY.US || defaultValues.country === CONST_1.default.COUNTRY.CA || defaultValues.country === ''), shouldDisplayStateSelector = _h[0], setShouldDisplayStateSelector = _h[1];
    var stepFieldsWithState = (0, react_1.useMemo)(function () { return [inputKeys.street, inputKeys.city, inputKeys.state, inputKeys.zipCode, countryInputKey]; }, [countryInputKey, inputKeys.city, inputKeys.state, inputKeys.street, inputKeys.zipCode]);
    var stepFieldsWithoutState = (0, react_1.useMemo)(function () { return [inputKeys.street, inputKeys.city, inputKeys.zipCode, countryInputKey]; }, [countryInputKey, inputKeys.city, inputKeys.street, inputKeys.zipCode]);
    var stepFields = shouldDisplayStateSelector ? stepFieldsWithState : stepFieldsWithoutState;
    var handleCountryChange = function (country) {
        if (typeof country !== 'string' || country === '') {
            return;
        }
        setShouldDisplayStateSelector(country === CONST_1.default.COUNTRY.US || country === CONST_1.default.COUNTRY.CA);
    };
    var handleNextStep = function () {
        // owner is US based we need to gather last four digits of his SSN
        if ((reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[inputKeys.country]) === CONST_1.default.COUNTRY.US) {
            onNext();
            // currency is set to GBP and owner is UK based, so we skip SSN and Documents step
        }
        else if (countryStepCountryValue === CONST_1.default.COUNTRY.GB && (reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[inputKeys.country]) === CONST_1.default.COUNTRY.GB) {
            onMove(6, false);
            // owner is not US based so we skip SSN step
        }
        else {
            onMove(5, false);
        }
    };
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: stepFields,
        onNext: handleNextStep,
        shouldSaveDraft: isEditing,
    });
    return (<AddressStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={formTitle} formPOBoxDisclaimer={translate('common.noPO')} onSubmit={handleSubmit} stepFields={stepFields} inputFieldsIDs={inputKeys} defaultValues={defaultValues} onCountryChange={handleCountryChange} shouldDisplayStateSelector={shouldDisplayStateSelector} shouldDisplayCountrySelector shouldValidateZipCodeFormat={(reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[inputKeys.country]) === CONST_1.default.COUNTRY.US}/>);
}
Address.displayName = 'Address';
exports.default = Address;

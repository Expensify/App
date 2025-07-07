"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AddressStep_1 = require("@components/SubStepForms/AddressStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var BENEFICIAL_OWNER_INFO_KEY = CONST_1.default.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;
var BENEFICIAL_OWNER_PREFIX = CONST_1.default.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;
function AddressUBO(_a) {
    var _b, _c, _d, _e;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing, beneficialOwnerBeingModifiedID = _a.beneficialOwnerBeingModifiedID;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var inputKeys = {
        street: "".concat(BENEFICIAL_OWNER_PREFIX, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(BENEFICIAL_OWNER_INFO_KEY.STREET),
        city: "".concat(BENEFICIAL_OWNER_PREFIX, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(BENEFICIAL_OWNER_INFO_KEY.CITY),
        state: "".concat(BENEFICIAL_OWNER_PREFIX, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(BENEFICIAL_OWNER_INFO_KEY.STATE),
        zipCode: "".concat(BENEFICIAL_OWNER_PREFIX, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(BENEFICIAL_OWNER_INFO_KEY.ZIP_CODE),
    };
    var defaultValues = {
        street: String((_b = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[inputKeys.street]) !== null && _b !== void 0 ? _b : ''),
        city: String((_c = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[inputKeys.city]) !== null && _c !== void 0 ? _c : ''),
        state: String((_d = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[inputKeys.state]) !== null && _d !== void 0 ? _d : ''),
        zipCode: String((_e = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[inputKeys.zipCode]) !== null && _e !== void 0 ? _e : ''),
    };
    var stepFields = [inputKeys.street, inputKeys.city, inputKeys.state, inputKeys.zipCode];
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: stepFields,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    return (<AddressStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={translate('beneficialOwnerInfoStep.enterTheOwnersAddress')} formPOBoxDisclaimer={translate('common.noPO')} onSubmit={handleSubmit} stepFields={stepFields} inputFieldsIDs={inputKeys} defaultValues={defaultValues} shouldShowHelpLinks={false}/>);
}
AddressUBO.displayName = 'AddressUBO';
exports.default = AddressUBO;

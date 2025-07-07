"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullNameStep_1 = require("@components/SubStepForms/FullNameStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var _a = CONST_1.default.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA, FIRST_NAME = _a.FIRST_NAME, LAST_NAME = _a.LAST_NAME;
var BENEFICIAL_OWNER_PREFIX = CONST_1.default.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;
function LegalNameUBO(_a) {
    var _b, _c;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing, beneficialOwnerBeingModifiedID = _a.beneficialOwnerBeingModifiedID;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var firstNameInputID = "".concat(BENEFICIAL_OWNER_PREFIX, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(FIRST_NAME);
    var lastNameInputID = "".concat(BENEFICIAL_OWNER_PREFIX, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(LAST_NAME);
    var stepFields = [firstNameInputID, lastNameInputID];
    var defaultValues = {
        firstName: String((_b = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[firstNameInputID]) !== null && _b !== void 0 ? _b : ''),
        lastName: String((_c = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[lastNameInputID]) !== null && _c !== void 0 ? _c : ''),
    };
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: stepFields,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    return (<FullNameStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={translate('beneficialOwnerInfoStep.enterLegalFirstAndLastName')} onSubmit={handleSubmit} stepFields={stepFields} firstNameInputID={firstNameInputID} lastNameInputID={lastNameInputID} defaultValues={defaultValues}/>);
}
LegalNameUBO.displayName = 'LegalNameUBO';
exports.default = LegalNameUBO;

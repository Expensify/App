"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var DateOfBirthStep_1 = require("@components/SubStepForms/DateOfBirthStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var DOB = CONST_1.default.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.DOB;
var BENEFICIAL_OWNER_PREFIX = CONST_1.default.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;
function DateOfBirthUBO(_a) {
    var _b;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing, beneficialOwnerBeingModifiedID = _a.beneficialOwnerBeingModifiedID;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var dobInputID = "".concat(BENEFICIAL_OWNER_PREFIX, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(DOB);
    var dobDefaultValue = String((_b = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[dobInputID]) !== null && _b !== void 0 ? _b : '');
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: [dobInputID],
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    return (<DateOfBirthStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={translate('beneficialOwnerInfoStep.enterTheDateOfBirthOfTheOwner')} onSubmit={handleSubmit} stepFields={[dobInputID]} dobInputID={dobInputID} dobDefaultValue={dobDefaultValue}/>);
}
DateOfBirthUBO.displayName = 'DateOfBirthUBO';
exports.default = DateOfBirthUBO;

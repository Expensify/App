"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SingleFieldStep_1 = require("@components/SubStepForms/SingleFieldStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var SIGNER_JOB_TITLE = ReimbursementAccountForm_1.default.ADDITIONAL_DATA.CORPAY.SIGNER_JOB_TITLE;
function JobTitle(_a) {
    var _b;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var inputID = SIGNER_JOB_TITLE;
    var defaultValue = String((_b = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[inputID]) !== null && _b !== void 0 ? _b : '');
    var validate = (0, react_1.useCallback)(function (values) {
        return (0, ValidationUtils_1.getFieldRequiredErrors)(values, [inputID]);
    }, [inputID]);
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: [inputID],
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    return (<SingleFieldStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={translate('signerInfoStep.whatsYourJobTitle')} validate={validate} onSubmit={handleSubmit} inputId={inputID} inputLabel={translate('signerInfoStep.jobTitle')} inputMode={CONST_1.default.INPUT_MODE.TEXT} defaultValue={defaultValue} shouldShowHelpLinks={false}/>);
}
JobTitle.displayName = 'JobTitle';
exports.default = JobTitle;

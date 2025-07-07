"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullNameStep_1 = require("@components/SubStepForms/FullNameStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var PERSONAL_INFO_STEP_KEY = ReimbursementAccountForm_1.default.PERSONAL_INFO_STEP;
var STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.FIRST_NAME, PERSONAL_INFO_STEP_KEY.LAST_NAME];
function FullName(_a) {
    var _b, _c, _d, _e;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var defaultValues = {
        firstName: (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b[PERSONAL_INFO_STEP_KEY.FIRST_NAME]) !== null && _c !== void 0 ? _c : '',
        lastName: (_e = (_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _d === void 0 ? void 0 : _d[PERSONAL_INFO_STEP_KEY.LAST_NAME]) !== null && _e !== void 0 ? _e : '',
    };
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    return (<FullNameStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={translate('personalInfoStep.enterYourLegalFirstAndLast')} onSubmit={handleSubmit} stepFields={STEP_FIELDS} firstNameInputID={PERSONAL_INFO_STEP_KEY.FIRST_NAME} lastNameInputID={PERSONAL_INFO_STEP_KEY.LAST_NAME} defaultValues={defaultValues}/>);
}
FullName.displayName = 'FullName';
exports.default = FullName;

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
var SSN_LAST_4 = CONST_1.default.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.SSN_LAST_4;
var BENEFICIAL_OWNER_PREFIX = CONST_1.default.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;
function SocialSecurityNumberUBO(_a) {
    var _b;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing, beneficialOwnerBeingModifiedID = _a.beneficialOwnerBeingModifiedID;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var ssnLast4InputID = "".concat(BENEFICIAL_OWNER_PREFIX, "_").concat(beneficialOwnerBeingModifiedID, "_").concat(SSN_LAST_4);
    var defaultSsnLast4 = String((_b = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[ssnLast4InputID]) !== null && _b !== void 0 ? _b : '');
    var stepFields = [ssnLast4InputID];
    var validate = function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, stepFields);
        if (values[ssnLast4InputID] && !(0, ValidationUtils_1.isValidSSNLastFour)(String(values[ssnLast4InputID]))) {
            errors[ssnLast4InputID] = translate('bankAccount.error.ssnLast4');
        }
        return errors;
    };
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: stepFields,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    return (<SingleFieldStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={translate('beneficialOwnerInfoStep.enterTheLast4')} formDisclaimer={translate('beneficialOwnerInfoStep.dontWorry')} validate={validate} onSubmit={handleSubmit} inputId={ssnLast4InputID} inputLabel={translate('beneficialOwnerInfoStep.last4SSN')} inputMode={CONST_1.default.INPUT_MODE.NUMERIC} defaultValue={defaultSsnLast4} shouldShowHelpLinks={false} maxLength={CONST_1.default.BANK_ACCOUNT.MAX_LENGTH.SSN}/>);
}
SocialSecurityNumberUBO.displayName = 'SocialSecurityNumberUBO';
exports.default = SocialSecurityNumberUBO;

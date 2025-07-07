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
var _a = CONST_1.default.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA, SSN_LAST_4 = _a.SSN_LAST_4, PREFIX = _a.PREFIX;
function Last4SSN(_a) {
    var _b;
    var onNext = _a.onNext, isEditing = _a.isEditing, onMove = _a.onMove, isUserEnteringHisOwnData = _a.isUserEnteringHisOwnData, ownerBeingModifiedID = _a.ownerBeingModifiedID;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccountDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT)[0];
    var last4SSNInputID = "".concat(PREFIX, "_").concat(ownerBeingModifiedID, "_").concat(SSN_LAST_4);
    var defaultLast4SSN = String((_b = reimbursementAccountDraft === null || reimbursementAccountDraft === void 0 ? void 0 : reimbursementAccountDraft[last4SSNInputID]) !== null && _b !== void 0 ? _b : '');
    var formTitle = translate(isUserEnteringHisOwnData ? 'ownershipInfoStep.whatsYourLast' : 'ownershipInfoStep.whatAreTheLast');
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, [last4SSNInputID]);
        if (values[last4SSNInputID] && !(0, ValidationUtils_1.isValidSSNLastFour)(String(values[last4SSNInputID]))) {
            errors[last4SSNInputID] = translate('bankAccount.error.ssnLast4');
        }
        return errors;
    }, [last4SSNInputID, translate]);
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: [last4SSNInputID],
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    return (<SingleFieldStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={formTitle} formDisclaimer={translate('beneficialOwnerInfoStep.dontWorry')} validate={validate} onSubmit={handleSubmit} inputId={last4SSNInputID} inputLabel={translate('ownershipInfoStep.last4')} inputMode={CONST_1.default.INPUT_MODE.NUMERIC} defaultValue={defaultLast4SSN} shouldShowHelpLinks={false} maxLength={CONST_1.default.BANK_ACCOUNT.MAX_LENGTH.SSN}/>);
}
Last4SSN.displayName = 'Last4SSN';
exports.default = Last4SSN;

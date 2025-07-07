"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var SingleFieldStep_1 = require("@components/SubStepForms/SingleFieldStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var PERSONAL_INFO_STEP_KEY = ReimbursementAccountForm_1.default.PERSONAL_INFO_STEP;
var STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.SSN_LAST_4];
function SocialSecurityNumber(_a) {
    var _b, _c;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var _d = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT), reimbursementAccount = _d[0], reimbursementAccountResult = _d[1];
    var isLoadingReimbursementAccount = (0, isLoadingOnyxValue_1.default)(reimbursementAccountResult);
    var defaultSsnLast4 = (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b[PERSONAL_INFO_STEP_KEY.SSN_LAST_4]) !== null && _c !== void 0 ? _c : '';
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, STEP_FIELDS);
        if (values.ssnLast4 && !(0, ValidationUtils_1.isValidSSNLastFour)(values.ssnLast4)) {
            errors.ssnLast4 = translate('bankAccount.error.ssnLast4');
        }
        return errors;
    }, [translate]);
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    if (isLoadingReimbursementAccount) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<SingleFieldStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={translate('personalInfoStep.enterTheLast4')} formDisclaimer={translate('personalInfoStep.dontWorry')} validate={validate} onSubmit={handleSubmit} inputId={PERSONAL_INFO_STEP_KEY.SSN_LAST_4} inputLabel={translate('personalInfoStep.last4SSN')} inputMode={CONST_1.default.INPUT_MODE.NUMERIC} defaultValue={defaultSsnLast4} maxLength={CONST_1.default.BANK_ACCOUNT.MAX_LENGTH.SSN} enabledWhenOffline/>);
}
SocialSecurityNumber.displayName = 'SocialSecurityNumber';
exports.default = SocialSecurityNumber;

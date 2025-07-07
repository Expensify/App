"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SingleFieldStep_1 = require("@components/SubStepForms/SingleFieldStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var BankAccount_1 = require("@libs/models/BankAccount");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var COMPANY_NAME_KEY = ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP.COMPANY_NAME;
var STEP_FIELDS = [COMPANY_NAME_KEY];
function NameBusiness(_a) {
    var _b, _c, _d, _e, _f;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var defaultCompanyName = (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.companyName) !== null && _c !== void 0 ? _c : '';
    var bankAccountID = (_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _d === void 0 ? void 0 : _d.bankAccountID;
    var bankAccountState = (_f = (_e = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _e === void 0 ? void 0 : _e.state) !== null && _f !== void 0 ? _f : '';
    var shouldDisableCompanyName = !!(bankAccountID && defaultCompanyName && ![BankAccount_1.default.STATE.SETUP, BankAccount_1.default.STATE.VERIFYING].includes(bankAccountState));
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, STEP_FIELDS);
        if (values.companyName && !(0, ValidationUtils_1.isValidCompanyName)(values.companyName)) {
            errors.companyName = translate('bankAccount.error.companyName');
        }
        return errors;
    }, [translate]);
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    return (<SingleFieldStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={translate('businessInfoStep.enterTheNameOfYourBusiness')} validate={validate} onSubmit={handleSubmit} inputId={COMPANY_NAME_KEY} inputLabel={translate('businessInfoStep.businessName')} defaultValue={defaultCompanyName} shouldUseDefaultValue={shouldDisableCompanyName} disabled={shouldDisableCompanyName} shouldShowHelpLinks={false}/>);
}
NameBusiness.displayName = 'NameBusiness';
exports.default = NameBusiness;

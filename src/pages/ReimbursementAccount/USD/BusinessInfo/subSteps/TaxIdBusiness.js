"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var SingleFieldStep_1 = require("@components/SubStepForms/SingleFieldStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var BankAccount_1 = require("@libs/models/BankAccount");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var COMPANY_TAX_ID_KEY = ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP.COMPANY_TAX_ID;
var STEP_FIELDS = [COMPANY_TAX_ID_KEY];
function TaxIdBusiness(_a) {
    var _b, _c, _d, _e, _f;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var _g = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT), reimbursementAccount = _g[0], reimbursementAccountResult = _g[1];
    var isLoadingReimbursementAccount = (0, isLoadingOnyxValue_1.default)(reimbursementAccountResult);
    // This is default value for the input to be display
    /* eslint-disable-next-line rulesdir/no-default-id-values */
    var defaultCompanyTaxID = (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.companyTaxID) !== null && _c !== void 0 ? _c : '';
    var bankAccountID = (_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _d === void 0 ? void 0 : _d.bankAccountID;
    var bankAccountState = (_f = (_e = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _e === void 0 ? void 0 : _e.state) !== null && _f !== void 0 ? _f : '';
    var shouldDisableCompanyTaxID = !!(bankAccountID && defaultCompanyTaxID && ![BankAccount_1.default.STATE.SETUP, BankAccount_1.default.STATE.VERIFYING].includes(bankAccountState));
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, STEP_FIELDS);
        if (values.companyTaxID && !(0, ValidationUtils_1.isValidTaxID)(values.companyTaxID)) {
            errors.companyTaxID = translate('bankAccount.error.taxID');
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
    return (<SingleFieldStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={translate('businessInfoStep.enterYourCompanyTaxIdNumber')} validate={validate} onSubmit={handleSubmit} inputId={COMPANY_TAX_ID_KEY} inputLabel={translate('businessInfoStep.taxIDNumber')} defaultValue={defaultCompanyTaxID} shouldUseDefaultValue={shouldDisableCompanyTaxID} disabled={shouldDisableCompanyTaxID} shouldShowHelpLinks={false} placeholder={translate('businessInfoStep.taxIDNumberPlaceholder')} inputMode={CONST_1.default.INPUT_MODE.NUMERIC}/>);
}
TaxIdBusiness.displayName = 'TaxIdBusiness';
exports.default = TaxIdBusiness;

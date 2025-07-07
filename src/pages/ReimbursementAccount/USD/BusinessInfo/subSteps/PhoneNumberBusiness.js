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
var COMPANY_PHONE_NUMBER_KEY = ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP.COMPANY_PHONE;
var STEP_FIELDS = [COMPANY_PHONE_NUMBER_KEY];
function PhoneNumberBusiness(_a) {
    var _b, _c;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var _d = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT), reimbursementAccount = _d[0], reimbursementAccountResult = _d[1];
    var isLoadingReimbursementAccount = (0, isLoadingOnyxValue_1.default)(reimbursementAccountResult);
    var defaultCompanyPhoneNumber = (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.companyPhone) !== null && _c !== void 0 ? _c : '';
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, STEP_FIELDS);
        if (values.companyPhone && !(0, ValidationUtils_1.isValidUSPhone)(values.companyPhone, true)) {
            errors.companyPhone = translate('bankAccount.error.phoneNumber');
        }
        return errors;
    }, [translate]);
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        // During draft saving, the phone number is sanitized (i.e. leading and trailing whitespace is removed)
        shouldSaveDraft: true,
    });
    if (isLoadingReimbursementAccount) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<SingleFieldStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={translate('businessInfoStep.enterYourCompanyPhoneNumber')} validate={validate} onSubmit={handleSubmit} inputId={COMPANY_PHONE_NUMBER_KEY} inputMode={CONST_1.default.INPUT_MODE.TEL} inputLabel={translate('common.phoneNumber')} defaultValue={defaultCompanyPhoneNumber} shouldShowHelpLinks={false} placeholder={translate('common.phoneNumberPlaceholder')}/>);
}
PhoneNumberBusiness.displayName = 'PhoneNumberBusiness';
exports.default = PhoneNumberBusiness;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var AddressStep_1 = require("@components/SubStepForms/AddressStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReimbursementAccountStepFormSubmit_1 = require("@hooks/useReimbursementAccountStepFormSubmit");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReimbursementAccountForm_1 = require("@src/types/form/ReimbursementAccountForm");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var COMPANY_BUSINESS_INFO_KEY = ReimbursementAccountForm_1.default.BUSINESS_INFO_STEP;
var INPUT_KEYS = {
    street: COMPANY_BUSINESS_INFO_KEY.STREET,
    city: COMPANY_BUSINESS_INFO_KEY.CITY,
    state: COMPANY_BUSINESS_INFO_KEY.STATE,
    zipCode: COMPANY_BUSINESS_INFO_KEY.ZIP_CODE,
};
var STEP_FIELDS = [COMPANY_BUSINESS_INFO_KEY.STREET, COMPANY_BUSINESS_INFO_KEY.CITY, COMPANY_BUSINESS_INFO_KEY.STATE, COMPANY_BUSINESS_INFO_KEY.ZIP_CODE];
function AddressBusiness(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var _m = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: false }), reimbursementAccount = _m[0], reimbursementAccountResult = _m[1];
    var isLoadingReimbursementAccount = (0, isLoadingOnyxValue_1.default)(reimbursementAccountResult);
    var defaultValues = {
        street: (_c = (_b = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _b === void 0 ? void 0 : _b.addressStreet) !== null && _c !== void 0 ? _c : '',
        city: (_e = (_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _d === void 0 ? void 0 : _d.addressCity) !== null && _e !== void 0 ? _e : '',
        state: (_g = (_f = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _f === void 0 ? void 0 : _f.addressState) !== null && _g !== void 0 ? _g : '',
        zipCode: (_j = (_h = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _h === void 0 ? void 0 : _h.addressZipCode) !== null && _j !== void 0 ? _j : '',
        country: (_l = (_k = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.achData) === null || _k === void 0 ? void 0 : _k.country) !== null && _l !== void 0 ? _l : '',
    };
    var handleSubmit = (0, useReimbursementAccountStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    if (isLoadingReimbursementAccount) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return (<AddressStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} formTitle={translate('businessInfoStep.enterYourCompanyAddress')} formPOBoxDisclaimer={translate('common.noPO')} onSubmit={handleSubmit} stepFields={STEP_FIELDS} inputFieldsIDs={INPUT_KEYS} defaultValues={defaultValues} shouldAllowCountryChange={false} streetTranslationKey="common.companyAddress"/>);
}
AddressBusiness.displayName = 'AddressBusiness';
exports.default = AddressBusiness;

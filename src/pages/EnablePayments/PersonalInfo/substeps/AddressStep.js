"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AddressStep_1 = require("@components/SubStepForms/AddressStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useWalletAdditionalDetailsStepFormSubmit_1 = require("@hooks/useWalletAdditionalDetailsStepFormSubmit");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var WalletAdditionalDetailsForm_1 = require("@src/types/form/WalletAdditionalDetailsForm");
var PERSONAL_INFO_STEP_KEY = WalletAdditionalDetailsForm_1.default.PERSONAL_INFO_STEP;
var INPUT_KEYS = {
    street: PERSONAL_INFO_STEP_KEY.STREET,
    city: PERSONAL_INFO_STEP_KEY.CITY,
    state: PERSONAL_INFO_STEP_KEY.STATE,
    zipCode: PERSONAL_INFO_STEP_KEY.ZIP_CODE,
};
var STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.STREET, PERSONAL_INFO_STEP_KEY.CITY, PERSONAL_INFO_STEP_KEY.STATE, PERSONAL_INFO_STEP_KEY.ZIP_CODE];
function AddressStep(_a) {
    var _b, _c, _d, _e;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var walletAdditionalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_ADDITIONAL_DETAILS)[0];
    var defaultValues = {
        street: (_b = walletAdditionalDetails === null || walletAdditionalDetails === void 0 ? void 0 : walletAdditionalDetails[PERSONAL_INFO_STEP_KEY.STREET]) !== null && _b !== void 0 ? _b : '',
        city: (_c = walletAdditionalDetails === null || walletAdditionalDetails === void 0 ? void 0 : walletAdditionalDetails[PERSONAL_INFO_STEP_KEY.CITY]) !== null && _c !== void 0 ? _c : '',
        state: (_d = walletAdditionalDetails === null || walletAdditionalDetails === void 0 ? void 0 : walletAdditionalDetails[PERSONAL_INFO_STEP_KEY.STATE]) !== null && _d !== void 0 ? _d : '',
        zipCode: (_e = walletAdditionalDetails === null || walletAdditionalDetails === void 0 ? void 0 : walletAdditionalDetails[PERSONAL_INFO_STEP_KEY.ZIP_CODE]) !== null && _e !== void 0 ? _e : '',
    };
    var handleSubmit = (0, useWalletAdditionalDetailsStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    return (<AddressStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.WALLET_ADDITIONAL_DETAILS} formTitle={translate('personalInfoStep.whatsYourAddress')} formPOBoxDisclaimer={translate('common.noPO')} onSubmit={handleSubmit} stepFields={STEP_FIELDS} inputFieldsIDs={INPUT_KEYS} defaultValues={defaultValues}/>);
}
AddressStep.displayName = 'AddressStep';
exports.default = AddressStep;

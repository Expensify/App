"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullNameStep_1 = require("@components/SubStepForms/FullNameStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useWalletAdditionalDetailsStepFormSubmit_1 = require("@hooks/useWalletAdditionalDetailsStepFormSubmit");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var WalletAdditionalDetailsForm_1 = require("@src/types/form/WalletAdditionalDetailsForm");
var PERSONAL_INFO_STEP_KEY = WalletAdditionalDetailsForm_1.default.PERSONAL_INFO_STEP;
var STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.FIRST_NAME, PERSONAL_INFO_STEP_KEY.LAST_NAME];
function LegalNameStep(_a) {
    var _b, _c;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var walletAdditionalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_ADDITIONAL_DETAILS)[0];
    var defaultValues = {
        firstName: (_b = walletAdditionalDetails === null || walletAdditionalDetails === void 0 ? void 0 : walletAdditionalDetails[PERSONAL_INFO_STEP_KEY.FIRST_NAME]) !== null && _b !== void 0 ? _b : '',
        lastName: (_c = walletAdditionalDetails === null || walletAdditionalDetails === void 0 ? void 0 : walletAdditionalDetails[PERSONAL_INFO_STEP_KEY.LAST_NAME]) !== null && _c !== void 0 ? _c : '',
    };
    var handleSubmit = (0, useWalletAdditionalDetailsStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    return (<FullNameStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.WALLET_ADDITIONAL_DETAILS} formTitle={translate('personalInfoStep.whatsYourLegalName')} onSubmit={handleSubmit} stepFields={STEP_FIELDS} firstNameInputID={PERSONAL_INFO_STEP_KEY.FIRST_NAME} lastNameInputID={PERSONAL_INFO_STEP_KEY.LAST_NAME} defaultValues={defaultValues}/>);
}
LegalNameStep.displayName = 'LegalNameStep';
exports.default = LegalNameStep;

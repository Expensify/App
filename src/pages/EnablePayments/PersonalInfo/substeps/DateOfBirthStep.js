"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var DateOfBirthStep_1 = require("@components/SubStepForms/DateOfBirthStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useWalletAdditionalDetailsStepFormSubmit_1 = require("@hooks/useWalletAdditionalDetailsStepFormSubmit");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var WalletAdditionalDetailsForm_1 = require("@src/types/form/WalletAdditionalDetailsForm");
var PERSONAL_INFO_DOB_KEY = WalletAdditionalDetailsForm_1.default.PERSONAL_INFO_STEP.DOB;
var STEP_FIELDS = [PERSONAL_INFO_DOB_KEY];
function DateOfBirthStep(_a) {
    var _b, _c;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var walletAdditionalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_ADDITIONAL_DETAILS)[0];
    var dobDefaultValue = (_c = (_b = walletAdditionalDetails === null || walletAdditionalDetails === void 0 ? void 0 : walletAdditionalDetails[PERSONAL_INFO_DOB_KEY]) !== null && _b !== void 0 ? _b : walletAdditionalDetails === null || walletAdditionalDetails === void 0 ? void 0 : walletAdditionalDetails[PERSONAL_INFO_DOB_KEY]) !== null && _c !== void 0 ? _c : '';
    var handleSubmit = (0, useWalletAdditionalDetailsStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    return (<DateOfBirthStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.WALLET_ADDITIONAL_DETAILS} formTitle={translate('personalInfoStep.whatsYourDOB')} onSubmit={handleSubmit} stepFields={STEP_FIELDS} dobInputID={PERSONAL_INFO_DOB_KEY} dobDefaultValue={dobDefaultValue}/>);
}
DateOfBirthStep.displayName = 'DateOfBirthStep';
exports.default = DateOfBirthStep;

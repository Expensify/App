"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SingleFieldStep_1 = require("@components/SubStepForms/SingleFieldStep");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useWalletAdditionalDetailsStepFormSubmit_1 = require("@hooks/useWalletAdditionalDetailsStepFormSubmit");
var LoginUtils_1 = require("@libs/LoginUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var WalletAdditionalDetailsForm_1 = require("@src/types/form/WalletAdditionalDetailsForm");
var PERSONAL_INFO_STEP_KEY = WalletAdditionalDetailsForm_1.default.PERSONAL_INFO_STEP;
var STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.PHONE_NUMBER];
function PhoneNumberStep(_a) {
    var _b;
    var onNext = _a.onNext, onMove = _a.onMove, isEditing = _a.isEditing;
    var translate = (0, useLocalize_1.default)().translate;
    var walletAdditionalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_ADDITIONAL_DETAILS)[0];
    var defaultPhoneNumber = (_b = walletAdditionalDetails === null || walletAdditionalDetails === void 0 ? void 0 : walletAdditionalDetails[PERSONAL_INFO_STEP_KEY.PHONE_NUMBER]) !== null && _b !== void 0 ? _b : '';
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, STEP_FIELDS);
        if (values.phoneNumber) {
            var phoneNumberWithCountryCode = (0, LoginUtils_1.appendCountryCode)(values.phoneNumber);
            var e164FormattedPhoneNumber = (0, LoginUtils_1.formatE164PhoneNumber)(values.phoneNumber);
            if (!(0, ValidationUtils_1.isValidPhoneNumber)(phoneNumberWithCountryCode) || !(0, ValidationUtils_1.isValidUSPhone)(e164FormattedPhoneNumber)) {
                errors.phoneNumber = translate('common.error.phoneNumber');
            }
        }
        return errors;
    }, [translate]);
    var handleSubmit = (0, useWalletAdditionalDetailsStepFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    return (<SingleFieldStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.WALLET_ADDITIONAL_DETAILS} formTitle={translate('personalInfoStep.whatsYourPhoneNumber')} formDisclaimer={translate('personalInfoStep.weNeedThisToVerify')} validate={validate} onSubmit={function (values) {
            var _a;
            handleSubmit(__assign(__assign({}, values), { phoneNumber: (_a = (0, LoginUtils_1.formatE164PhoneNumber)(values.phoneNumber)) !== null && _a !== void 0 ? _a : '' }));
        }} inputId={PERSONAL_INFO_STEP_KEY.PHONE_NUMBER} inputLabel={translate('common.phoneNumber')} inputMode={CONST_1.default.INPUT_MODE.TEL} defaultValue={defaultPhoneNumber} enabledWhenOffline/>);
}
PhoneNumberStep.displayName = 'PhoneNumberStep';
exports.default = PhoneNumberStep;

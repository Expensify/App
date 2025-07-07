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
var usePersonalDetailsFormSubmit_1 = require("@hooks/usePersonalDetailsFormSubmit");
var LoginUtils_1 = require("@libs/LoginUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var PersonalDetailsForm_1 = require("@src/types/form/PersonalDetailsForm");
var STEP_FIELDS = [PersonalDetailsForm_1.default.PHONE_NUMBER];
function PhoneNumberStep(_a) {
    var isEditing = _a.isEditing, onNext = _a.onNext, onMove = _a.onMove, personalDetailsValues = _a.personalDetailsValues;
    var translate = (0, useLocalize_1.default)().translate;
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        var phoneNumber = values[PersonalDetailsForm_1.default.PHONE_NUMBER];
        var phoneNumberWithCountryCode = (0, LoginUtils_1.appendCountryCode)(phoneNumber);
        if (!(0, ValidationUtils_1.isRequiredFulfilled)(phoneNumber)) {
            errors[PersonalDetailsForm_1.default.PHONE_NUMBER] = translate('common.error.fieldRequired');
            return errors;
        }
        if (!(0, ValidationUtils_1.isValidPhoneNumber)(phoneNumberWithCountryCode)) {
            errors[PersonalDetailsForm_1.default.PHONE_NUMBER] = translate('common.error.phoneNumber');
        }
        return errors;
    }, [translate]);
    var handleSubmit = (0, usePersonalDetailsFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: true,
    });
    return (<SingleFieldStep_1.default isEditing={isEditing} onNext={onNext} onMove={onMove} formID={ONYXKEYS_1.default.FORMS.PERSONAL_DETAILS_FORM} formTitle={translate('privatePersonalDetails.enterPhoneNumber')} validate={validate} onSubmit={function (values) {
            var _a;
            handleSubmit(__assign(__assign({}, values), { phoneNumber: (_a = (0, LoginUtils_1.formatE164PhoneNumber)(values[PersonalDetailsForm_1.default.PHONE_NUMBER])) !== null && _a !== void 0 ? _a : '' }));
        }} inputId={PersonalDetailsForm_1.default.PHONE_NUMBER} inputLabel={translate('common.phoneNumber')} inputMode={CONST_1.default.INPUT_MODE.TEL} defaultValue={personalDetailsValues[PersonalDetailsForm_1.default.PHONE_NUMBER]} shouldShowHelpLinks={false}/>);
}
PhoneNumberStep.displayName = 'PhoneNumberStep';
exports.default = PhoneNumberStep;

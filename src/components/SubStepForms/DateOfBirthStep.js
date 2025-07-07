"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var date_fns_1 = require("date-fns");
var react_1 = require("react");
var DatePicker_1 = require("@components/DatePicker");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
function DateOfBirthStep(_a) {
    var formID = _a.formID, formTitle = _a.formTitle, customValidate = _a.customValidate, onSubmit = _a.onSubmit, stepFields = _a.stepFields, dobInputID = _a.dobInputID, dobDefaultValue = _a.dobDefaultValue, isEditing = _a.isEditing, footerComponent = _a.footerComponent;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var minDate = (0, date_fns_1.subYears)(new Date(), CONST_1.default.DATE_BIRTH.MAX_AGE);
    var maxDate = (0, date_fns_1.subYears)(new Date(), CONST_1.default.DATE_BIRTH.MIN_AGE_FOR_PAYMENT);
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, stepFields);
        var valuesToValidate = values[dobInputID];
        if (valuesToValidate) {
            if (!(0, ValidationUtils_1.isValidPastDate)(valuesToValidate) || !(0, ValidationUtils_1.meetsMaximumAgeRequirement)(valuesToValidate)) {
                // @ts-expect-error type mismatch to be fixed
                errors[dobInputID] = translate('bankAccount.error.dob');
            }
            else if (!(0, ValidationUtils_1.meetsMinimumAgeRequirement)(valuesToValidate)) {
                // @ts-expect-error type mismatch to be fixed
                errors[dobInputID] = translate('bankAccount.error.age');
            }
        }
        return errors;
    }, [dobInputID, stepFields, translate]);
    return (<FormProvider_1.default formID={formID} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} validate={customValidate !== null && customValidate !== void 0 ? customValidate : validate} onSubmit={onSubmit} style={[styles.mh5, styles.flexGrow2, styles.justifyContentBetween]} submitButtonStyles={[styles.mb0]} enabledWhenOffline shouldHideFixErrorsAlert>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mb5]}>{formTitle}</Text_1.default>
            <InputWrapper_1.default InputComponent={DatePicker_1.default} inputID={dobInputID} label={translate('common.dob')} placeholder={translate('common.dateFormat')} defaultValue={dobDefaultValue} minDate={minDate} maxDate={maxDate} shouldSaveDraft={!isEditing} autoFocus/>
            {footerComponent}
        </FormProvider_1.default>);
}
DateOfBirthStep.displayName = 'DateOfBirthStep';
exports.default = DateOfBirthStep;

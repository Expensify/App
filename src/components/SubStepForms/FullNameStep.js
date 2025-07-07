"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var HelpLinks_1 = require("@pages/ReimbursementAccount/USD/Requestor/PersonalInfo/HelpLinks");
var CONST_1 = require("@src/CONST");
function FullNameStep(_a) {
    var formID = _a.formID, formTitle = _a.formTitle, customValidate = _a.customValidate, onSubmit = _a.onSubmit, stepFields = _a.stepFields, firstNameInputID = _a.firstNameInputID, lastNameInputID = _a.lastNameInputID, defaultValues = _a.defaultValues, isEditing = _a.isEditing, _b = _a.shouldShowHelpLinks, shouldShowHelpLinks = _b === void 0 ? true : _b, customFirstNameLabel = _a.customFirstNameLabel, customLastNameLabel = _a.customLastNameLabel;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, stepFields);
        var firstName = values[firstNameInputID];
        if (!(0, ValidationUtils_1.isRequiredFulfilled)(firstName)) {
            // @ts-expect-error type mismatch to be fixed
            errors[firstNameInputID] = translate('common.error.fieldRequired');
        }
        else if (!(0, ValidationUtils_1.isValidLegalName)(firstName)) {
            // @ts-expect-error type mismatch to be fixed
            errors[firstNameInputID] = translate('privatePersonalDetails.error.hasInvalidCharacter');
        }
        else if (firstName.length > CONST_1.default.LEGAL_NAME.MAX_LENGTH) {
            // @ts-expect-error type mismatch to be fixed
            errors[firstNameInputID] = translate('common.error.characterLimitExceedCounter', {
                length: firstName.length,
                limit: CONST_1.default.LEGAL_NAME.MAX_LENGTH,
            });
        }
        if ((0, ValidationUtils_1.doesContainReservedWord)(firstName, CONST_1.default.DISPLAY_NAME.RESERVED_NAMES)) {
            // @ts-expect-error type mismatch to be fixed
            errors[firstNameInputID] = translate('personalDetails.error.containsReservedWord');
        }
        var lastName = values[lastNameInputID];
        if (!(0, ValidationUtils_1.isRequiredFulfilled)(lastName)) {
            // @ts-expect-error type mismatch to be fixed
            errors[lastNameInputID] = translate('common.error.fieldRequired');
        }
        else if (!(0, ValidationUtils_1.isValidLegalName)(lastName)) {
            // @ts-expect-error type mismatch to be fixed
            errors[lastNameInputID] = translate('privatePersonalDetails.error.hasInvalidCharacter');
        }
        else if (lastName.length > CONST_1.default.LEGAL_NAME.MAX_LENGTH) {
            // @ts-expect-error type mismatch to be fixed
            errors[lastNameInputID] = translate('common.error.characterLimitExceedCounter', {
                length: lastName.length,
                limit: CONST_1.default.LEGAL_NAME.MAX_LENGTH,
            });
        }
        if ((0, ValidationUtils_1.doesContainReservedWord)(lastName, CONST_1.default.DISPLAY_NAME.RESERVED_NAMES)) {
            // @ts-expect-error type mismatch to be fixed
            errors[lastNameInputID] = translate('personalDetails.error.containsReservedWord');
        }
        return errors;
    }, [firstNameInputID, lastNameInputID, stepFields, translate]);
    return (<FormProvider_1.default formID={formID} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} validate={customValidate !== null && customValidate !== void 0 ? customValidate : validate} onSubmit={onSubmit} style={[styles.mh5, styles.flexGrow1]} enabledWhenOffline>
            <react_native_1.View>
                <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{formTitle}</Text_1.default>
                <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={firstNameInputID} label={customFirstNameLabel !== null && customFirstNameLabel !== void 0 ? customFirstNameLabel : translate('personalInfoStep.legalFirstName')} aria-label={customFirstNameLabel !== null && customFirstNameLabel !== void 0 ? customFirstNameLabel : translate('personalInfoStep.legalFirstName')} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={defaultValues.firstName} shouldSaveDraft={!isEditing} containerStyles={[styles.mb6]}/>
                <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={lastNameInputID} label={customLastNameLabel !== null && customLastNameLabel !== void 0 ? customLastNameLabel : translate('personalInfoStep.legalLastName')} aria-label={customLastNameLabel !== null && customLastNameLabel !== void 0 ? customLastNameLabel : translate('personalInfoStep.legalLastName')} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={defaultValues.lastName} shouldSaveDraft={!isEditing} containerStyles={[styles.mb6]}/>
                {shouldShowHelpLinks && <HelpLinks_1.default />}
            </react_native_1.View>
        </FormProvider_1.default>);
}
FullNameStep.displayName = 'FullNameStep';
exports.default = FullNameStep;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var AddressFormFields_1 = require("@pages/ReimbursementAccount/AddressFormFields");
var HelpLinks_1 = require("@pages/ReimbursementAccount/USD/Requestor/PersonalInfo/HelpLinks");
function AddressStep(_a) {
    var formID = _a.formID, formTitle = _a.formTitle, formPOBoxDisclaimer = _a.formPOBoxDisclaimer, customValidate = _a.customValidate, onSubmit = _a.onSubmit, stepFields = _a.stepFields, inputFieldsIDs = _a.inputFieldsIDs, defaultValues = _a.defaultValues, shouldShowHelpLinks = _a.shouldShowHelpLinks, isEditing = _a.isEditing, _b = _a.shouldDisplayCountrySelector, shouldDisplayCountrySelector = _b === void 0 ? false : _b, _c = _a.shouldDisplayStateSelector, shouldDisplayStateSelector = _c === void 0 ? true : _c, stateSelectorLabel = _a.stateSelectorLabel, stateSelectorModalHeaderTitle = _a.stateSelectorModalHeaderTitle, stateSelectorSearchInputTitle = _a.stateSelectorSearchInputTitle, onCountryChange = _a.onCountryChange, _d = _a.streetTranslationKey, streetTranslationKey = _d === void 0 ? 'common.streetAddress' : _d, _e = _a.shouldAllowCountryChange, shouldAllowCountryChange = _e === void 0 ? true : _e, _f = _a.shouldValidateZipCodeFormat, shouldValidateZipCodeFormat = _f === void 0 ? true : _f;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var formRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        var _a;
        // When stepFields change (e.g. country changes) we need to reset state errors manually
        (_a = formRef.current) === null || _a === void 0 ? void 0 : _a.resetFormFieldError(inputFieldsIDs.state);
    }, [inputFieldsIDs.state, stepFields]);
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, stepFields);
        var street = values[inputFieldsIDs.street];
        if (street && !(0, ValidationUtils_1.isValidAddress)(street)) {
            // @ts-expect-error type mismatch to be fixed
            errors[inputFieldsIDs.street] = translate('bankAccount.error.addressStreet');
        }
        var zipCode = values[inputFieldsIDs.zipCode];
        if (shouldValidateZipCodeFormat && zipCode && (shouldDisplayCountrySelector ? !(0, ValidationUtils_1.isValidZipCodeInternational)(zipCode) : !(0, ValidationUtils_1.isValidZipCode)(zipCode))) {
            // @ts-expect-error type mismatch to be fixed
            errors[inputFieldsIDs.zipCode] = translate('bankAccount.error.zipCode');
        }
        return errors;
    }, [inputFieldsIDs.street, inputFieldsIDs.zipCode, shouldDisplayCountrySelector, shouldValidateZipCodeFormat, stepFields, translate]);
    return (<FormProvider_1.default formID={formID} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} validate={customValidate !== null && customValidate !== void 0 ? customValidate : validate} onSubmit={onSubmit} style={[styles.mh5, styles.flexGrow1]} ref={formRef} enabledWhenOffline>
            <react_native_1.View>
                <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{formTitle}</Text_1.default>
                {!!formPOBoxDisclaimer && <Text_1.default style={[styles.textSupporting]}>{formPOBoxDisclaimer}</Text_1.default>}
                <AddressFormFields_1.default inputKeys={inputFieldsIDs} streetTranslationKey={streetTranslationKey} defaultValues={defaultValues} shouldSaveDraft={!isEditing} shouldDisplayStateSelector={shouldDisplayStateSelector} shouldDisplayCountrySelector={shouldDisplayCountrySelector} stateSelectorLabel={stateSelectorLabel} stateSelectorModalHeaderTitle={stateSelectorModalHeaderTitle} stateSelectorSearchInputTitle={stateSelectorSearchInputTitle} onCountryChange={onCountryChange} shouldAllowCountryChange={shouldAllowCountryChange} shouldValidateZipCodeFormat={shouldValidateZipCodeFormat}/>
                {!!shouldShowHelpLinks && <HelpLinks_1.default containerStyles={[styles.mt6]}/>}
            </react_native_1.View>
        </FormProvider_1.default>);
}
AddressStep.displayName = 'AddressStep';
exports.default = AddressStep;

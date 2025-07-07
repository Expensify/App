"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var HomeAddressForm_1 = require("@src/types/form/HomeAddressForm");
var AddressSearch_1 = require("./AddressSearch");
var CountrySelector_1 = require("./CountrySelector");
var FormProvider_1 = require("./Form/FormProvider");
var InputWrapper_1 = require("./Form/InputWrapper");
var StateSelector_1 = require("./StateSelector");
var TextInput_1 = require("./TextInput");
function AddressForm(_a) {
    var _b, _c;
    var _d = _a.city, city = _d === void 0 ? '' : _d, _e = _a.country, country = _e === void 0 ? '' : _e, formID = _a.formID, _f = _a.onAddressChanged, onAddressChanged = _f === void 0 ? function () { } : _f, onSubmit = _a.onSubmit, _g = _a.shouldSaveDraft, shouldSaveDraft = _g === void 0 ? false : _g, _h = _a.state, state = _h === void 0 ? '' : _h, _j = _a.street1, street1 = _j === void 0 ? '' : _j, _k = _a.street2, street2 = _k === void 0 ? '' : _k, _l = _a.submitButtonText, submitButtonText = _l === void 0 ? '' : _l, _m = _a.zip, zip = _m === void 0 ? '' : _m;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var zipSampleFormat = (_c = (country && ((_b = CONST_1.default.COUNTRY_ZIP_REGEX_DATA[country]) === null || _b === void 0 ? void 0 : _b.samples))) !== null && _c !== void 0 ? _c : '';
    var zipFormat = translate('common.zipCodeExampleFormat', { zipSampleFormat: zipSampleFormat });
    var isUSAForm = country === CONST_1.default.COUNTRY.US;
    /**
     * @param translate - translate function
     * @param isUSAForm - selected country ISO code is US
     * @param values - form input values
     * @returns - An object containing the errors for each inputID
     */
    var validator = (0, react_1.useCallback)(function (values) {
        var _a, _b, _c, _d, _e, _f, _g;
        var errors = {};
        var requiredFields = ['addressLine1', 'city', 'country', 'state'];
        // Check "State" dropdown is a valid state if selected Country is USA
        if (values.country === CONST_1.default.COUNTRY.US && !values.state) {
            errors.state = translate('common.error.fieldRequired');
        }
        // Add "Field required" errors if any required field is empty
        requiredFields.forEach(function (fieldKey) {
            var _a;
            var fieldValue = (_a = values[fieldKey]) !== null && _a !== void 0 ? _a : '';
            if ((0, ValidationUtils_1.isRequiredFulfilled)(fieldValue)) {
                return;
            }
            errors[fieldKey] = translate('common.error.fieldRequired');
        });
        if (values.addressLine2.length > CONST_1.default.FORM_CHARACTER_LIMIT) {
            errors.addressLine2 = translate('common.error.characterLimitExceedCounter', {
                length: values.addressLine2.length,
                limit: CONST_1.default.FORM_CHARACTER_LIMIT,
            });
        }
        if (values.city.length > CONST_1.default.FORM_CHARACTER_LIMIT) {
            errors.city = translate('common.error.characterLimitExceedCounter', {
                length: values.city.length,
                limit: CONST_1.default.FORM_CHARACTER_LIMIT,
            });
        }
        if (values.country !== CONST_1.default.COUNTRY.US && values.state.length > CONST_1.default.STATE_CHARACTER_LIMIT) {
            errors.state = translate('common.error.characterLimitExceedCounter', {
                length: values.state.length,
                limit: CONST_1.default.STATE_CHARACTER_LIMIT,
            });
        }
        // If no country is selected, default value is an empty string and there's no related regex data so we default to an empty object
        var countryRegexDetails = (values.country ? (_a = CONST_1.default.COUNTRY_ZIP_REGEX_DATA) === null || _a === void 0 ? void 0 : _a[values.country] : {});
        // The postal code system might not exist for a country, so no regex either for them.
        var countrySpecificZipRegex = countryRegexDetails === null || countryRegexDetails === void 0 ? void 0 : countryRegexDetails.regex;
        var countryZipFormat = (_b = countryRegexDetails === null || countryRegexDetails === void 0 ? void 0 : countryRegexDetails.samples) !== null && _b !== void 0 ? _b : '';
        if (countrySpecificZipRegex) {
            if (!countrySpecificZipRegex.test((_c = values.zipPostCode) === null || _c === void 0 ? void 0 : _c.trim().toUpperCase())) {
                if ((0, ValidationUtils_1.isRequiredFulfilled)((_d = values.zipPostCode) === null || _d === void 0 ? void 0 : _d.trim())) {
                    errors.zipPostCode = translate('privatePersonalDetails.error.incorrectZipFormat', { zipFormat: countryZipFormat });
                }
                else {
                    errors.zipPostCode = translate('common.error.fieldRequired');
                }
            }
        }
        else if (!CONST_1.default.GENERIC_ZIP_CODE_REGEX.test((_g = (_f = (_e = values === null || values === void 0 ? void 0 : values.zipPostCode) === null || _e === void 0 ? void 0 : _e.trim()) === null || _f === void 0 ? void 0 : _f.toUpperCase()) !== null && _g !== void 0 ? _g : '')) {
            errors.zipPostCode = translate('privatePersonalDetails.error.incorrectZipFormat');
        }
        return errors;
    }, [translate]);
    return (<FormProvider_1.default style={[styles.flexGrow1, styles.mh5]} formID={formID} validate={validator} onSubmit={onSubmit} submitButtonText={submitButtonText} enabledWhenOffline addBottomSafeAreaPadding>
            <react_native_1.View>
                <InputWrapper_1.default InputComponent={AddressSearch_1.default} inputID={HomeAddressForm_1.default.ADDRESS_LINE_1} label={translate('common.addressLine', { lineNumber: 1 })} onValueChange={function (data, key) {
            onAddressChanged(data, key);
        }} defaultValue={street1} renamedInputKeys={{
            street: HomeAddressForm_1.default.ADDRESS_LINE_1,
            street2: HomeAddressForm_1.default.ADDRESS_LINE_2,
            city: HomeAddressForm_1.default.CITY,
            state: HomeAddressForm_1.default.STATE,
            zipCode: HomeAddressForm_1.default.ZIP_POST_CODE,
            country: HomeAddressForm_1.default.COUNTRY,
        }} maxInputLength={CONST_1.default.FORM_CHARACTER_LIMIT} shouldSaveDraft={shouldSaveDraft}/>
            </react_native_1.View>
            <react_native_1.View style={styles.formSpaceVertical}/>
            <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={HomeAddressForm_1.default.ADDRESS_LINE_2} label={translate('common.addressLine', { lineNumber: 2 })} aria-label={translate('common.addressLine', { lineNumber: 2 })} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={street2} spellCheck={false} shouldSaveDraft={shouldSaveDraft}/>
            <react_native_1.View style={styles.formSpaceVertical}/>
            <react_native_1.View style={styles.mhn5}>
                <InputWrapper_1.default InputComponent={CountrySelector_1.default} inputID={HomeAddressForm_1.default.COUNTRY} value={country} onValueChange={onAddressChanged} shouldSaveDraft={shouldSaveDraft}/>
            </react_native_1.View>
            <react_native_1.View style={styles.formSpaceVertical}/>
            {isUSAForm ? (<react_native_1.View style={styles.mhn5}>
                    <InputWrapper_1.default InputComponent={StateSelector_1.default} inputID={HomeAddressForm_1.default.STATE} value={state} onValueChange={onAddressChanged} shouldSaveDraft={shouldSaveDraft}/>
                </react_native_1.View>) : (<InputWrapper_1.default InputComponent={TextInput_1.default} inputID={HomeAddressForm_1.default.STATE} label={translate('common.stateOrProvince')} aria-label={translate('common.stateOrProvince')} role={CONST_1.default.ROLE.PRESENTATION} value={state} spellCheck={false} onValueChange={onAddressChanged} shouldSaveDraft={shouldSaveDraft}/>)}
            <react_native_1.View style={styles.formSpaceVertical}/>
            <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={HomeAddressForm_1.default.CITY} label={translate('common.city')} aria-label={translate('common.city')} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={city} spellCheck={false} onValueChange={onAddressChanged} shouldSaveDraft={shouldSaveDraft}/>
            <react_native_1.View style={styles.formSpaceVertical}/>
            <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={HomeAddressForm_1.default.ZIP_POST_CODE} label={translate('common.zipPostCode')} aria-label={translate('common.zipPostCode')} role={CONST_1.default.ROLE.PRESENTATION} autoCapitalize="characters" defaultValue={zip} hint={zipFormat} onValueChange={onAddressChanged} shouldSaveDraft={shouldSaveDraft}/>
        </FormProvider_1.default>);
}
AddressForm.displayName = 'AddressForm';
exports.default = AddressForm;

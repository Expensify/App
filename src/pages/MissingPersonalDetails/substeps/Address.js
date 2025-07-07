"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var AddressSearch_1 = require("@components/AddressSearch");
var CountryPicker_1 = require("@components/CountryPicker");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var StatePicker_1 = require("@components/StatePicker");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var usePersonalDetailsFormSubmit_1 = require("@hooks/usePersonalDetailsFormSubmit");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var PersonalDetailsForm_1 = require("@src/types/form/PersonalDetailsForm");
var STEP_FIELDS = [PersonalDetailsForm_1.default.ADDRESS_LINE_1, PersonalDetailsForm_1.default.ADDRESS_LINE_2, PersonalDetailsForm_1.default.CITY, PersonalDetailsForm_1.default.STATE, PersonalDetailsForm_1.default.ZIP_POST_CODE, PersonalDetailsForm_1.default.COUNTRY];
function AddressStep(_a) {
    var _b, _c;
    var isEditing = _a.isEditing, onNext = _a.onNext, personalDetailsValues = _a.personalDetailsValues;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _d = (0, react_1.useState)(personalDetailsValues[PersonalDetailsForm_1.default.COUNTRY]), currentCountry = _d[0], setCurrentCountry = _d[1];
    var _e = (0, react_1.useState)(personalDetailsValues[PersonalDetailsForm_1.default.STATE]), state = _e[0], setState = _e[1];
    var _f = (0, react_1.useState)(personalDetailsValues[PersonalDetailsForm_1.default.CITY]), city = _f[0], setCity = _f[1];
    var _g = (0, react_1.useState)(personalDetailsValues[PersonalDetailsForm_1.default.ZIP_POST_CODE]), zipcode = _g[0], setZipcode = _g[1];
    var handleSubmit = (0, usePersonalDetailsFormSubmit_1.default)({
        fieldIds: STEP_FIELDS,
        onNext: onNext,
        shouldSaveDraft: true,
    });
    var validate = (0, react_1.useCallback)(function (values) {
        var _a, _b, _c, _d, _e, _f, _g;
        var errors = {};
        var addressRequiredFields = [PersonalDetailsForm_1.default.ADDRESS_LINE_1, PersonalDetailsForm_1.default.CITY, PersonalDetailsForm_1.default.COUNTRY, PersonalDetailsForm_1.default.STATE];
        addressRequiredFields.forEach(function (fieldKey) {
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
            if (!countrySpecificZipRegex.test((_c = values[PersonalDetailsForm_1.default.ZIP_POST_CODE]) === null || _c === void 0 ? void 0 : _c.trim().toUpperCase())) {
                if ((0, ValidationUtils_1.isRequiredFulfilled)((_d = values[PersonalDetailsForm_1.default.ZIP_POST_CODE]) === null || _d === void 0 ? void 0 : _d.trim())) {
                    errors[PersonalDetailsForm_1.default.ZIP_POST_CODE] = translate('privatePersonalDetails.error.incorrectZipFormat', { zipFormat: countryZipFormat });
                }
                else {
                    errors[PersonalDetailsForm_1.default.ZIP_POST_CODE] = translate('common.error.fieldRequired');
                }
            }
        }
        else if (!CONST_1.default.GENERIC_ZIP_CODE_REGEX.test((_g = (_f = (_e = values[PersonalDetailsForm_1.default.ZIP_POST_CODE]) === null || _e === void 0 ? void 0 : _e.trim()) === null || _f === void 0 ? void 0 : _f.toUpperCase()) !== null && _g !== void 0 ? _g : '')) {
            errors[PersonalDetailsForm_1.default.ZIP_POST_CODE] = translate('privatePersonalDetails.error.incorrectZipFormat');
        }
        return errors;
    }, [translate]);
    var handleAddressChange = (0, react_1.useCallback)(function (value, key) {
        var addressPart = value;
        var addressPartKey = key;
        if (addressPartKey !== PersonalDetailsForm_1.default.COUNTRY && addressPartKey !== PersonalDetailsForm_1.default.STATE && addressPartKey !== PersonalDetailsForm_1.default.CITY && addressPartKey !== PersonalDetailsForm_1.default.ZIP_POST_CODE) {
            return;
        }
        if (addressPartKey === PersonalDetailsForm_1.default.COUNTRY) {
            setCurrentCountry(addressPart);
            setState('');
            setCity('');
            setZipcode('');
            return;
        }
        if (addressPartKey === PersonalDetailsForm_1.default.STATE) {
            setState(addressPart);
            setCity('');
            setZipcode('');
            return;
        }
        if (addressPartKey === PersonalDetailsForm_1.default.CITY) {
            setCity(addressPart);
            setZipcode('');
            return;
        }
        setZipcode(addressPart);
    }, []);
    var isUSAForm = currentCountry === CONST_1.default.COUNTRY.US;
    var zipSampleFormat = (_c = (currentCountry && ((_b = CONST_1.default.COUNTRY_ZIP_REGEX_DATA[currentCountry]) === null || _b === void 0 ? void 0 : _b.samples))) !== null && _c !== void 0 ? _c : '';
    var zipFormat = translate('common.zipCodeExampleFormat', { zipSampleFormat: zipSampleFormat });
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.PERSONAL_DETAILS_FORM} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} onSubmit={handleSubmit} validate={validate} style={[styles.flexGrow1, styles.mt3]} submitButtonStyles={[styles.ph5, styles.mb0]} enabledWhenOffline>
            <react_native_1.View style={styles.ph5}>
                <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('privatePersonalDetails.enterAddress')}</Text_1.default>
                <react_native_1.View>
                    <InputWrapper_1.default InputComponent={AddressSearch_1.default} inputID={PersonalDetailsForm_1.default.ADDRESS_LINE_1} label={translate('common.addressLine', { lineNumber: 1 })} onValueChange={function (data, key) {
            handleAddressChange(data, key);
        }} defaultValue={personalDetailsValues[PersonalDetailsForm_1.default.ADDRESS_LINE_1]} renamedInputKeys={{
            street: PersonalDetailsForm_1.default.ADDRESS_LINE_1,
            street2: PersonalDetailsForm_1.default.ADDRESS_LINE_2,
            city: PersonalDetailsForm_1.default.CITY,
            state: PersonalDetailsForm_1.default.STATE,
            zipCode: PersonalDetailsForm_1.default.ZIP_POST_CODE,
            country: PersonalDetailsForm_1.default.COUNTRY,
        }} maxInputLength={CONST_1.default.FORM_CHARACTER_LIMIT}/>
                </react_native_1.View>
                <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={PersonalDetailsForm_1.default.ADDRESS_LINE_2} label={translate('common.addressLine', { lineNumber: 2 })} aria-label={translate('common.addressLine', { lineNumber: 2 })} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={personalDetailsValues[PersonalDetailsForm_1.default.ADDRESS_LINE_2]} spellCheck={false} containerStyles={styles.mt5}/>
                <react_native_1.View style={[styles.mt2, styles.mhn5]}>
                    <InputWrapper_1.default InputComponent={CountryPicker_1.default} inputID={PersonalDetailsForm_1.default.COUNTRY} value={currentCountry} onValueChange={handleAddressChange}/>
                </react_native_1.View>
                {isUSAForm ? (<react_native_1.View style={[styles.mt2, styles.mhn5]}>
                        <InputWrapper_1.default InputComponent={StatePicker_1.default} inputID={PersonalDetailsForm_1.default.STATE} value={state} onValueChange={handleAddressChange}/>
                    </react_native_1.View>) : (<InputWrapper_1.default InputComponent={TextInput_1.default} inputID={PersonalDetailsForm_1.default.STATE} label={translate('common.stateOrProvince')} aria-label={translate('common.stateOrProvince')} role={CONST_1.default.ROLE.PRESENTATION} value={state} spellCheck={false} onValueChange={handleAddressChange} containerStyles={styles.mt2}/>)}
                <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={PersonalDetailsForm_1.default.CITY} label={translate('common.city')} aria-label={translate('common.city')} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={city} spellCheck={false} onValueChange={handleAddressChange} containerStyles={isUSAForm ? styles.mt2 : styles.mt5}/>
                <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={PersonalDetailsForm_1.default.ZIP_POST_CODE} label={translate('common.zipPostCode')} aria-label={translate('common.zipPostCode')} role={CONST_1.default.ROLE.PRESENTATION} autoCapitalize="characters" defaultValue={zipcode} hint={zipFormat} onValueChange={handleAddressChange} containerStyles={styles.mt5}/>
            </react_native_1.View>
        </FormProvider_1.default>);
}
AddressStep.displayName = 'AddressStep';
exports.default = AddressStep;

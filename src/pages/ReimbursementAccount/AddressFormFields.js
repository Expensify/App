"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("expensify-common/dist/CONST");
var react_1 = require("react");
var react_native_1 = require("react-native");
var AddressSearch_1 = require("@components/AddressSearch");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var PushRowWithModal_1 = require("@components/PushRowWithModal");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_2 = require("@src/CONST");
var PROVINCES_LIST_OPTIONS = Object.keys(CONST_1.CONST.PROVINCES).reduce(function (acc, key) {
    acc[CONST_1.CONST.PROVINCES[key].provinceISO] = CONST_1.CONST.PROVINCES[key].provinceName;
    return acc;
}, {});
var STATES_LIST_OPTIONS = Object.keys(CONST_1.CONST.STATES).reduce(function (acc, key) {
    acc[CONST_1.CONST.STATES[key].stateISO] = CONST_1.CONST.STATES[key].stateName;
    return acc;
}, {});
function AddressFormFields(_a) {
    var _b, _c, _d, _e, _f, _g;
    var _h = _a.shouldSaveDraft, shouldSaveDraft = _h === void 0 ? false : _h, defaultValues = _a.defaultValues, values = _a.values, errors = _a.errors, inputKeys = _a.inputKeys, streetTranslationKey = _a.streetTranslationKey, containerStyles = _a.containerStyles, _j = _a.shouldDisplayCountrySelector, shouldDisplayCountrySelector = _j === void 0 ? false : _j, _k = _a.shouldDisplayStateSelector, shouldDisplayStateSelector = _k === void 0 ? true : _k, stateSelectorLabel = _a.stateSelectorLabel, stateSelectorModalHeaderTitle = _a.stateSelectorModalHeaderTitle, stateSelectorSearchInputTitle = _a.stateSelectorSearchInputTitle, onCountryChange = _a.onCountryChange, _l = _a.shouldAllowCountryChange, shouldAllowCountryChange = _l === void 0 ? true : _l, _m = _a.shouldValidateZipCodeFormat, shouldValidateZipCodeFormat = _m === void 0 ? true : _m;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _o = (0, react_1.useState)((_b = defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.country) !== null && _b !== void 0 ? _b : CONST_2.default.COUNTRY.US), countryInEditMode = _o[0], setCountryInEditMode = _o[1];
    // When draft values are not being saved we need to relay on local state to determine the currently selected country
    var currentlySelectedCountry = shouldSaveDraft ? defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.country : countryInEditMode;
    var handleCountryChange = function (country) {
        if (typeof country === 'string' && country !== '') {
            setCountryInEditMode(country);
        }
        onCountryChange === null || onCountryChange === void 0 ? void 0 : onCountryChange(country);
    };
    return (<react_native_1.View style={containerStyles}>
            <react_native_1.View>
                <InputWrapper_1.default InputComponent={AddressSearch_1.default} inputID={inputKeys === null || inputKeys === void 0 ? void 0 : inputKeys.street} shouldSaveDraft={shouldSaveDraft} label={translate(streetTranslationKey)} containerStyles={styles.mt6} value={values === null || values === void 0 ? void 0 : values.street} defaultValue={defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.street} errorText={(errors === null || errors === void 0 ? void 0 : errors.street) ? translate('bankAccount.error.addressStreet') : ''} renamedInputKeys={inputKeys} maxInputLength={CONST_2.default.FORM_CHARACTER_LIMIT} limitSearchesToCountry={shouldAllowCountryChange ? undefined : defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.country} onCountryChange={handleCountryChange}/>
            </react_native_1.View>
            <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={(_c = inputKeys.city) !== null && _c !== void 0 ? _c : 'cityInput'} shouldSaveDraft={shouldSaveDraft} label={translate('common.city')} accessibilityLabel={translate('common.city')} role={CONST_2.default.ROLE.PRESENTATION} value={values === null || values === void 0 ? void 0 : values.city} defaultValue={defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.city} errorText={(errors === null || errors === void 0 ? void 0 : errors.city) ? translate('bankAccount.error.addressCity') : ''} containerStyles={styles.mt6}/>

            {shouldDisplayStateSelector && (<react_native_1.View style={[styles.mt3, styles.mhn5]}>
                    <InputWrapper_1.default InputComponent={PushRowWithModal_1.default} optionsList={shouldDisplayCountrySelector && currentlySelectedCountry === CONST_2.default.COUNTRY.CA ? PROVINCES_LIST_OPTIONS : STATES_LIST_OPTIONS} shouldSaveDraft={shouldSaveDraft} description={stateSelectorLabel !== null && stateSelectorLabel !== void 0 ? stateSelectorLabel : translate('common.state')} modalHeaderTitle={stateSelectorModalHeaderTitle !== null && stateSelectorModalHeaderTitle !== void 0 ? stateSelectorModalHeaderTitle : translate('common.state')} searchInputTitle={stateSelectorSearchInputTitle !== null && stateSelectorSearchInputTitle !== void 0 ? stateSelectorSearchInputTitle : translate('common.state')} value={values === null || values === void 0 ? void 0 : values.state} defaultValue={defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.state} inputID={(_d = inputKeys.state) !== null && _d !== void 0 ? _d : 'stateInput'} errorText={(errors === null || errors === void 0 ? void 0 : errors.state) ? translate('bankAccount.error.addressState') : ''}/>
                </react_native_1.View>)}
            <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={(_e = inputKeys.zipCode) !== null && _e !== void 0 ? _e : 'zipCodeInput'} shouldSaveDraft={shouldSaveDraft} label={translate('common.zip')} accessibilityLabel={translate('common.zip')} role={CONST_2.default.ROLE.PRESENTATION} inputMode={shouldValidateZipCodeFormat ? CONST_2.default.INPUT_MODE.NUMERIC : undefined} value={values === null || values === void 0 ? void 0 : values.zipCode} defaultValue={defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.zipCode} errorText={(errors === null || errors === void 0 ? void 0 : errors.zipCode) ? translate('bankAccount.error.zipCode') : ''} hint={translate('common.zipCodeExampleFormat', { zipSampleFormat: CONST_2.default.COUNTRY_ZIP_REGEX_DATA.US.samples })} containerStyles={styles.mt3}/>
            {shouldDisplayCountrySelector && (<react_native_1.View style={[styles.mt3, styles.mhn5]}>
                    <InputWrapper_1.default InputComponent={PushRowWithModal_1.default} inputID={(_f = inputKeys === null || inputKeys === void 0 ? void 0 : inputKeys.country) !== null && _f !== void 0 ? _f : 'country'} shouldSaveDraft={shouldSaveDraft} optionsList={CONST_2.default.ALL_COUNTRIES} description={translate('common.country')} modalHeaderTitle={translate('countryStep.selectCountry')} searchInputTitle={translate('countryStep.findCountry')} value={values === null || values === void 0 ? void 0 : values.country} defaultValue={defaultValues === null || defaultValues === void 0 ? void 0 : defaultValues.country} onValueChange={handleCountryChange} stateInputIDToReset={(_g = inputKeys.state) !== null && _g !== void 0 ? _g : 'stateInput'} shouldAllowChange={shouldAllowCountryChange}/>
                </react_native_1.View>)}
        </react_native_1.View>);
}
AddressFormFields.displayName = 'AddressFormFields';
exports.default = AddressFormFields;

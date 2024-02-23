import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/HomeAddressForm';
import AddressSearch from './AddressSearch';
import CountrySelector from './CountrySelector';
import FormProvider from './Form/FormProvider';
import InputWrapper from './Form/InputWrapper';
import StatePicker from './StatePicker';
import TextInput from './TextInput';

const propTypes = {
    /** Address city field */
    city: PropTypes.string,

    /** Address country field */
    country: PropTypes.string,

    /** Address state field */
    state: PropTypes.string,

    /** Address street line 1 field */
    street1: PropTypes.string,

    /** Address street line 2 field */
    street2: PropTypes.string,

    /** Address zip code field */
    zip: PropTypes.string,

    /** Callback which is executed when the user changes address, city or state */
    onAddressChanged: PropTypes.func,

    /** Callback which is executed when the user submits his address changes */
    onSubmit: PropTypes.func.isRequired,

    /** Whether or not should the form data should be saved as draft */
    shouldSaveDraft: PropTypes.bool,

    /** Text displayed on the bottom submit button */
    submitButtonText: PropTypes.string,

    /** A unique Onyx key identifying the form */
    formID: PropTypes.string.isRequired,
};

const defaultProps = {
    city: '',
    country: '',
    onAddressChanged: () => {},
    shouldSaveDraft: false,
    state: '',
    street1: '',
    street2: '',
    submitButtonText: '',
    zip: '',
};

function AddressForm({city, country, formID, onAddressChanged, onSubmit, shouldSaveDraft, state, street1, street2, submitButtonText, zip}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const zipSampleFormat = lodashGet(CONST.COUNTRY_ZIP_REGEX_DATA, [country, 'samples'], '');
    const zipFormat = ['common.zipCodeExampleFormat', {zipSampleFormat}];
    const isUSAForm = country === CONST.COUNTRY.US;

    /**
     * @param {Function} translate - translate function
     * @param {Boolean} isUSAForm - selected country ISO code is US
     * @param {Object} values - form input values
     * @returns {Object} - An object containing the errors for each inputID
     */
    const validator = useCallback((values) => {
        const errors = {};
        const requiredFields = ['addressLine1', 'city', 'country', 'state'];

        // Check "State" dropdown is a valid state if selected Country is USA
        if (values.country === CONST.COUNTRY.US && !COMMON_CONST.STATES[values.state]) {
            errors.state = 'common.error.fieldRequired';
        }

        // Add "Field required" errors if any required field is empty
        _.each(requiredFields, (fieldKey) => {
            if (ValidationUtils.isRequiredFulfilled(values[fieldKey])) {
                return;
            }
            errors[fieldKey] = 'common.error.fieldRequired';
        });

        // If no country is selected, default value is an empty string and there's no related regex data so we default to an empty object
        const countryRegexDetails = lodashGet(CONST.COUNTRY_ZIP_REGEX_DATA, values.country, {});

        // The postal code system might not exist for a country, so no regex either for them.
        const countrySpecificZipRegex = lodashGet(countryRegexDetails, 'regex');
        const countryZipFormat = lodashGet(countryRegexDetails, 'samples');

        if (countrySpecificZipRegex) {
            if (!countrySpecificZipRegex.test(values.zipPostCode.trim().toUpperCase())) {
                if (ValidationUtils.isRequiredFulfilled(values.zipPostCode.trim())) {
                    errors.zipPostCode = ['privatePersonalDetails.error.incorrectZipFormat', countryZipFormat];
                } else {
                    errors.zipPostCode = 'common.error.fieldRequired';
                }
            }
        } else if (!CONST.GENERIC_ZIP_CODE_REGEX.test(values.zipPostCode.trim().toUpperCase())) {
            errors.zipPostCode = 'privatePersonalDetails.error.incorrectZipFormat';
        }

        return errors;
    }, []);

    return (
        <FormProvider
            style={[styles.flexGrow1, styles.mh5]}
            formID={formID}
            validate={validator}
            onSubmit={onSubmit}
            submitButtonText={submitButtonText}
            enabledWhenOffline
        >
            <View>
                <InputWrapper
                    InputComponent={AddressSearch}
                    inputID={INPUT_IDS.ADDRESS_LINE_1}
                    label={translate('common.addressLine', {lineNumber: 1})}
                    onValueChange={(data, key) => {
                        onAddressChanged(data, key);
                        // This enforces the country selector to use the country from address instead of the country from URL
                        Navigation.setParams({country: undefined});
                    }}
                    defaultValue={street1 || ''}
                    renamedInputKeys={{
                        street: INPUT_IDS.ADDRESS_LINE_1,
                        street2: INPUT_IDS.ADDRESS_LINE_2,
                        city: INPUT_IDS.CITY,
                        state: INPUT_IDS.STATE,
                        zipCode: INPUT_IDS.ZIP_POST_CODE,
                        country: INPUT_IDS.COUNTRY,
                    }}
                    maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                    shouldSaveDraft={shouldSaveDraft}
                />
            </View>
            <View style={styles.formSpaceVertical} />
            <InputWrapper
                InputComponent={TextInput}
                inputID={INPUT_IDS.ADDRESS_LINE_2}
                label={translate('common.addressLine', {lineNumber: 2})}
                aria-label={translate('common.addressLine', {lineNumber: 2})}
                role={CONST.ACCESSIBILITY_ROLE.TEXT}
                defaultValue={street2 || ''}
                maxLength={CONST.FORM_CHARACTER_LIMIT}
                spellCheck={false}
                shouldSaveDraft={shouldSaveDraft}
            />
            <View style={styles.formSpaceVertical} />
            <View style={styles.mhn5}>
                <InputWrapper
                    InputComponent={CountrySelector}
                    inputID={INPUT_IDS.COUNTRY}
                    value={country}
                    shouldSaveDraft={shouldSaveDraft}
                />
            </View>
            <View style={styles.formSpaceVertical} />
            {isUSAForm ? (
                <View style={styles.mhn5}>
                    <InputWrapper
                        InputComponent={StatePicker}
                        inputID={INPUT_IDS.STATE}
                        defaultValue={state}
                        onValueChange={onAddressChanged}
                        shouldSaveDraft={shouldSaveDraft}
                    />
                </View>
            ) : (
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.STATE}
                    label={translate('common.stateOrProvince')}
                    aria-label={translate('common.stateOrProvince')}
                    role={CONST.ACCESSIBILITY_ROLE.TEXT}
                    value={state || ''}
                    maxLength={CONST.FORM_CHARACTER_LIMIT}
                    spellCheck={false}
                    onValueChange={onAddressChanged}
                    shouldSaveDraft={shouldSaveDraft}
                />
            )}
            <View style={styles.formSpaceVertical} />
            <InputWrapper
                InputComponent={TextInput}
                inputID={INPUT_IDS.CITY}
                label={translate('common.city')}
                aria-label={translate('common.city')}
                role={CONST.ACCESSIBILITY_ROLE.TEXT}
                defaultValue={city || ''}
                maxLength={CONST.FORM_CHARACTER_LIMIT}
                spellCheck={false}
                onValueChange={onAddressChanged}
                shouldSaveDraft={shouldSaveDraft}
            />
            <View style={styles.formSpaceVertical} />
            <InputWrapper
                InputComponent={TextInput}
                inputID={INPUT_IDS.ZIP_POST_CODE}
                label={translate('common.zipPostCode')}
                aria-label={translate('common.zipPostCode')}
                role={CONST.ACCESSIBILITY_ROLE.TEXT}
                autoCapitalize="characters"
                defaultValue={zip || ''}
                maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                hint={zipFormat}
                onValueChange={onAddressChanged}
                shouldSaveDraft={shouldSaveDraft}
            />
        </FormProvider>
    );
}

AddressForm.defaultProps = defaultProps;
AddressForm.displayName = 'AddressForm';
AddressForm.propTypes = propTypes;

export default AddressForm;

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getCountryZipRegexDetails} from '@libs/ValidationUtils';

import type {Country} from '@src/CONST';
import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/HomeAddressForm';

import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useState} from 'react';
import {View} from 'react-native';

import AddressSearch from './AddressSearch';
import CountryPicker from './CountryPicker';
import InputWrapper from './Form/InputWrapper';
import StatePicker from './StatePicker';
import TextInput from './TextInput';

type AddressFieldsProps = {
    /** Address line 1 to prefill */
    street1?: string;

    /** Address line 2 to prefill */
    street2?: string;

    /** City to prefill */
    city?: string;

    /** State or province to prefill */
    state?: string;

    /** Zip or postal code to prefill */
    zip?: string;

    /** Country to prefill */
    defaultCountry?: Country | '';

    /** Country picked in the form, which decides the state input and the zip format hint */
    country?: Country | '';
};

function AddressFields({street1, street2, city, state, zip, defaultCountry, country}: AddressFieldsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [stateValue, setStateValue] = useState(state ?? '');
    const [cityValue, setCityValue] = useState(city ?? '');
    const [zipValue, setZipValue] = useState(zip ?? '');

    // The state list only has US states, so a state kept from another country shows as empty
    const usStateValue = stateValue in COMMON_CONST.STATES ? stateValue : '';

    // A state, city or zip from another country isn't valid for the new one
    const updateAddress = (value: unknown, key: unknown) => {
        if (key === INPUT_IDS.COUNTRY && value !== country) {
            setStateValue('');
            setCityValue('');
            setZipValue('');
            return;
        }
        if (typeof value !== 'string') {
            return;
        }
        if (key === INPUT_IDS.STATE) {
            setStateValue(value);
        } else if (key === INPUT_IDS.CITY) {
            setCityValue(value);
        } else if (key === INPUT_IDS.ZIP_POST_CODE) {
            setZipValue(value);
        }
    };

    return (
        <>
            <InputWrapper
                InputComponent={AddressSearch}
                inputID={INPUT_IDS.ADDRESS_LINE_1}
                label={translate('common.addressLine', 1)}
                defaultValue={street1}
                onValueChange={updateAddress}
                renamedInputKeys={{
                    street: INPUT_IDS.ADDRESS_LINE_1,
                    street2: INPUT_IDS.ADDRESS_LINE_2,
                    city: INPUT_IDS.CITY,
                    state: INPUT_IDS.STATE,
                    zipCode: INPUT_IDS.ZIP_POST_CODE,
                    country: INPUT_IDS.COUNTRY,
                }}
                autoComplete="address-line1"
            />
            <View style={styles.formSpaceVertical} />
            <InputWrapper
                InputComponent={TextInput}
                inputID={INPUT_IDS.ADDRESS_LINE_2}
                label={translate('common.addressLine', 2)}
                aria-label={translate('common.addressLine', 2)}
                role={CONST.ROLE.PRESENTATION}
                defaultValue={street2}
                spellCheck={false}
                autoComplete="address-line2"
            />
            <View style={styles.formSpaceVertical} />
            <View style={styles.mhn5}>
                <InputWrapper
                    InputComponent={CountryPicker}
                    inputID={INPUT_IDS.COUNTRY}
                    defaultValue={defaultCountry}
                    onValueChange={updateAddress}
                />
            </View>
            <View style={styles.formSpaceVertical} />
            {country === CONST.COUNTRY.US ? (
                <View style={styles.mhn5}>
                    <InputWrapper
                        InputComponent={StatePicker}
                        inputID={INPUT_IDS.STATE}
                        value={usStateValue}
                        onValueChange={updateAddress}
                    />
                </View>
            ) : (
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.STATE}
                    label={translate('common.stateOrProvince')}
                    aria-label={translate('common.stateOrProvince')}
                    role={CONST.ROLE.PRESENTATION}
                    value={stateValue}
                    onValueChange={updateAddress}
                    spellCheck={false}
                />
            )}
            <View style={styles.formSpaceVertical} />
            <InputWrapper
                InputComponent={TextInput}
                inputID={INPUT_IDS.CITY}
                label={translate('common.city')}
                aria-label={translate('common.city')}
                role={CONST.ROLE.PRESENTATION}
                value={cityValue}
                onValueChange={updateAddress}
                spellCheck={false}
            />
            <View style={styles.formSpaceVertical} />
            <InputWrapper
                InputComponent={TextInput}
                inputID={INPUT_IDS.ZIP_POST_CODE}
                label={translate('common.zipPostCode')}
                aria-label={translate('common.zipPostCode')}
                role={CONST.ROLE.PRESENTATION}
                autoCapitalize="characters"
                value={zipValue}
                onValueChange={updateAddress}
                hint={translate('common.zipCodeExampleFormat', getCountryZipRegexDetails(country)?.samples ?? '')}
                autoComplete="postal-code"
            />
        </>
    );
}

export default AddressFields;

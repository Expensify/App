import AddressSearch from '@components/AddressSearch';
import InputWrapper from '@components/Form/InputWrapper';

import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import React from 'react';
import {View} from 'react-native';

import {useAddressFields} from './AddressFieldsProvider';

type AddressStreetInputProps = {
    /** Translate key for Street name */
    translationKey: TranslationPaths;

    /** Whether a picked address fills the state with its code outside the US and Canada, for a caller that lists the states of other countries */
    shouldKeepStateCode?: boolean;

    /** Country the address search suggests places in, for an address whose country cannot be changed */
    limitSearchesToCountry?: Country | '';

    /** Longest street the user can type, in characters. Defaults to CONST.FORM_CHARACTER_LIMIT. */
    maxInputLength?: number;

    /** Codes of the countries a picked address can be in. A pick in any other country leaves the country empty. */
    allowedCountries?: string[];
};

/** The street of an address, which searches for places and fills in the other parts from the one picked */
function AddressStreetInput({translationKey, shouldKeepStateCode = false, limitSearchesToCountry, maxInputLength = CONST.FORM_CHARACTER_LIMIT, allowedCountries}: AddressStreetInputProps) {
    const {translate} = useLocalize();
    const {inputKeys, values, defaultValues, errors, shouldSaveDraft, changeCountry, forwardedFSClass} = useAddressFields();

    return (
        <View>
            <InputWrapper
                InputComponent={AddressSearch}
                inputID={inputKeys?.street}
                shouldSaveDraft={shouldSaveDraft}
                label={translate(translationKey)}
                value={values?.street}
                defaultValue={defaultValues?.street}
                errorText={errors?.street ? translate('bankAccount.error.addressStreet') : ''}
                renamedInputKeys={inputKeys}
                shouldKeepStateCode={shouldKeepStateCode}
                maxInputLength={maxInputLength}
                limitSearchesToCountry={limitSearchesToCountry}
                allowedCountries={allowedCountries}
                onCountryChange={changeCountry}
                forwardedFSClass={forwardedFSClass}
                autoComplete="address-line1"
            />
        </View>
    );
}

export default AddressStreetInput;

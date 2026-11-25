import InputWrapper from '@components/Form/InputWrapper';
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getCountryZipRegexDetails} from '@libs/ValidationUtils';

import CONST from '@src/CONST';

import React from 'react';

import {useAddressFields} from './AddressFieldsProvider';

/** The zip code of an address, with an example in the format of the address's country */
function AddressZipCodeInput() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputKeys, values, defaultValues, errors, shouldSaveDraft, country, forwardedFSClass} = useAddressFields();
    const zipSampleFormat = getCountryZipRegexDetails(country)?.samples ?? '';

    return (
        <InputWrapper
            InputComponent={TextInput}
            inputID={inputKeys.zipCode ?? 'zipCodeInput'}
            shouldSaveDraft={shouldSaveDraft}
            label={translate('common.zip')}
            accessibilityLabel={translate('common.zip')}
            role={CONST.ROLE.PRESENTATION}
            inputMode={country === CONST.COUNTRY.US ? CONST.INPUT_MODE.NUMERIC : undefined}
            value={values?.zipCode}
            defaultValue={defaultValues?.zipCode}
            errorText={errors?.zipCode ? translate('bankAccount.error.zipCode') : ''}
            hint={translate('common.zipCodeExampleFormat', zipSampleFormat)}
            containerStyles={styles.mt3}
            forwardedFSClass={forwardedFSClass}
            autoComplete="postal-code"
        />
    );
}

export default AddressZipCodeInput;

import InputWrapper from '@components/Form/InputWrapper';
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';

import {useAddressFields} from './AddressFieldsProvider';

type AddressCityInputProps = {
    /** Styles of the city input, which sits 24px below the street unless the caller spaces its inputs differently */
    containerStyles?: StyleProp<ViewStyle>;
};

/** The city of an address */
function AddressCityInput({containerStyles}: AddressCityInputProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {inputKeys, values, defaultValues, errors, shouldSaveDraft, forwardedFSClass} = useAddressFields();

    return (
        <InputWrapper
            InputComponent={TextInput}
            inputID={inputKeys.city ?? 'cityInput'}
            shouldSaveDraft={shouldSaveDraft}
            label={translate('common.city')}
            accessibilityLabel={translate('common.city')}
            role={CONST.ROLE.PRESENTATION}
            value={values?.city}
            defaultValue={defaultValues?.city}
            errorText={errors?.city ? translate('bankAccount.error.addressCity') : ''}
            containerStyles={containerStyles ?? styles.mt6}
            forwardedFSClass={forwardedFSClass}
            autoComplete="address-line2"
        />
    );
}

export default AddressCityInput;

import getAddressInputKeys, {getAddressCountry, isStateAsked} from '@components/DynamicForm/utils/getAddressInputKeys';
import isSensitiveField from '@components/DynamicForm/utils/isSensitiveField';

import AddressFormFields from '@pages/ReimbursementAccount/AddressFormFields';

import React from 'react';

import type {DynamicFieldRenderer} from './types';

/** An address drawn as one input per part, each under its own draft key */
const renderAddress: DynamicFieldRenderer<'address'> = (field, {values}, {shouldSaveDraft, forwardedFSClass, onValueChange, defaultValue}) => {
    const addressKeys = getAddressInputKeys(field.key);
    const country = getAddressCountry(field.key, values);
    // The street arrives as the field's answer. The other parts of a sensitive address are not drafted either, so they start from memory too.
    const getSensitivePart = (key: string) => {
        const part = values[key];
        return isSensitiveField(field) && typeof part === 'string' ? part : undefined;
    };
    return {
        isMenuRow: false,
        labelAbove: 'heading',
        input: (
            <AddressFormFields
                inputKeys={addressKeys}
                // AddressFormFields lists the states of the default country, and assumes the US without one
                defaultValues={{
                    street: defaultValue ?? '',
                    city: getSensitivePart(addressKeys.city),
                    state: getSensitivePart(addressKeys.state),
                    zipCode: getSensitivePart(addressKeys.zipCode),
                    country,
                }}
                streetTranslationKey="common.streetAddress"
                shouldSaveDraft={shouldSaveDraft}
                shouldDisplayCountrySelector
                shouldDisplayStateSelector={isStateAsked(country)}
                forwardedFSClass={forwardedFSClass}
                onCountryChange={(pickedCountry) => {
                    // AddressSearch reports the country on every pick and the state reset arrives as '', so only a new country refreshes
                    if (typeof pickedCountry !== 'string' || pickedCountry === '' || pickedCountry === country) {
                        return;
                    }
                    onValueChange?.(pickedCountry, addressKeys.country);
                }}
            />
        ),
    };
};

export default renderAddress;

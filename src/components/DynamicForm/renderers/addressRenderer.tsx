import getAddressInputKeys, {isStateAsked} from '@components/DynamicForm/utils/getAddressInputKeys';

import AddressFormFields from '@pages/ReimbursementAccount/AddressFormFields';

import React from 'react';

import type {DynamicFieldRenderer} from './types';

const renderAddress: DynamicFieldRenderer<'address'> = (field, {values}, {shouldSaveDraft, forwardedFSClass, onValueChange}) => {
    const addressKeys = getAddressInputKeys(field.key);
    return {
        isMenuRow: false,
        labelAbove: 'heading',
        input: (
            <AddressFormFields
                inputKeys={addressKeys}
                streetTranslationKey="common.streetAddress"
                shouldSaveDraft={shouldSaveDraft}
                shouldDisplayCountrySelector
                shouldDisplayStateSelector={isStateAsked(values[addressKeys.country])}
                forwardedFSClass={forwardedFSClass}
                onCountryChange={(country) => {
                    if (typeof country !== 'string') {
                        return;
                    }
                    onValueChange?.(country, addressKeys.country);
                }}
            />
        ),
    };
};

export default renderAddress;

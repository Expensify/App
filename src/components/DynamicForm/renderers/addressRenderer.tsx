import DynamicFormAddressCountryDropdown from '@components/DynamicForm/components/DynamicFormAddressCountryDropdown';
import DynamicFormAddressStateDropdown from '@components/DynamicForm/components/DynamicFormAddressStateDropdown';
import getAddressInputKeys, {getAddressCountry, getAllowedCountries, getStateOptions, isStateAsked, isZipCodeShown} from '@components/DynamicForm/utils/getAddressInputKeys';
import isSensitiveField from '@components/DynamicForm/utils/isSensitiveField';

import AddressFields from '@pages/ReimbursementAccount/AddressFormFields/AddressFields';

import React from 'react';

import type {DynamicFieldRenderer} from './types';

/**
 * An address drawn as one input per part, each under its own draft key. Every part has its own label, so no heading is drawn above them.
 * The state and country open as dropdown rows, like the form's other choice fields.
 */
const renderAddress: DynamicFieldRenderer<'address'> = (field, {values, styles, translate}, {shouldSaveDraft, forwardedFSClass, onValueChange, defaultValue, disabled}) => {
    const addressKeys = getAddressInputKeys(field.key);
    const country = getAddressCountry(field.key, values);
    const allowedCountries = getAllowedCountries(field);
    const stateOptions = isStateAsked(field, country) ? getStateOptions(field, country, translate) : undefined;
    // The street arrives as the field's answer. The other parts of a sensitive address are not drafted either, so they start from memory too.
    const getSensitivePart = (key: string) => {
        const part = values[key];
        return isSensitiveField(field) && typeof part === 'string' ? part : undefined;
    };
    return {
        isMenuRow: false,
        input: (
            <AddressFields.Provider
                inputKeys={addressKeys}
                // The state list and zip code format follow the default country, and assume the US without one
                defaultValues={{
                    street: defaultValue ?? '',
                    city: getSensitivePart(addressKeys.city),
                    state: getSensitivePart(addressKeys.state),
                    zipCode: getSensitivePart(addressKeys.zipCode),
                    country,
                }}
                shouldSaveDraft={shouldSaveDraft}
                forwardedFSClass={forwardedFSClass}
                onCountryChange={(pickedCountry, pickedAddress) => {
                    // AddressSearch reports the country on every pick and the state reset arrives as '', so only a new country refreshes
                    if (typeof pickedCountry !== 'string' || pickedCountry === '' || pickedCountry === country) {
                        return;
                    }
                    // The draft still holds the address from before the change. An address search pick replaces its parts, and a pick from the country list clears the state.
                    const changedAnswers = pickedAddress
                        ? {
                              [addressKeys.street]: pickedAddress.street,
                              [addressKeys.city]: pickedAddress.city,
                              [addressKeys.state]: pickedAddress.state,
                              [addressKeys.zipCode]: pickedAddress.zipCode,
                          }
                        : {[addressKeys.state]: ''};
                    onValueChange?.(pickedCountry, addressKeys.country, changedAnswers);
                }}
            >
                <AddressFields.Street
                    translationKey="common.streetAddress"
                    // The pick can switch to any country with a state list, so the code is kept even while the current country has none
                    shouldKeepStateCode
                    // While the country is locked, the search only suggests places in it, so a pick cannot change it
                    limitSearchesToCountry={disabled ? country : undefined}
                    allowedCountries={allowedCountries}
                    maxInputLength={field.maxLength}
                />
                {/* The city sits as far below the street as the field rows space any two inputs */}
                <AddressFields.City
                    containerStyles={styles.mt4}
                    maxLength={field.cityFormat?.maxLength}
                />
                {/* The state is asked only where there is a list of the country's states */}
                {!!stateOptions && (
                    <DynamicFormAddressStateDropdown
                        stateOptions={stateOptions}
                        label={field.stateLabel}
                    />
                )}
                {isZipCodeShown(field) && <AddressFields.ZipCode />}
                {/* Only the country asks for a new form, so the rest of the address stays editable offline */}
                <DynamicFormAddressCountryDropdown
                    disabled={disabled}
                    countries={allowedCountries}
                />
            </AddressFields.Provider>
        ),
    };
};

export default renderAddress;

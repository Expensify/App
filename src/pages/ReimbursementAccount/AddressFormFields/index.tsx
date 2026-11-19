import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import CONST from '@src/CONST';
import {CANADIAN_PROVINCES, US_STATES} from '@src/CONST/STATES_BY_COUNTRY';
import type {TranslationPaths} from '@src/languages/types';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {AddressErrors, AddressInputKeys} from './types';

import AddressFields, {useAddressFields} from './AddressFields';

type AddressFormProps = ForwardedFSClassProps & {
    /** Translate key for Street name */
    streetTranslationKey: TranslationPaths;

    defaultValues?: Address;
    values?: Address;

    /** Any errors that can arise from form validation */
    errors?: AddressErrors;

    inputKeys: AddressInputKeys;

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft?: boolean;

    containerStyles?: StyleProp<ViewStyle>;

    /** Styles of the city input, which sits 24px below the street unless the caller spaces its inputs differently */
    cityContainerStyles?: StyleProp<ViewStyle>;
    shouldDisplayCountrySelector?: boolean;
    shouldDisplayStateSelector?: boolean;
    stateSelectorLabel?: string;
    stateSelectorModalHeaderTitle?: string;
    stateSelectorSearchInputTitle?: string;

    /** The states to list instead of the US states or Canadian provinces */
    stateOptions?: Record<string, string>;

    /** Whether a picked address fills the state with its code outside the US and Canada, for a caller that lists the states of other countries */
    shouldKeepStateCode?: boolean;
    onCountryChange?: (country: unknown) => void;
    shouldAllowCountryChange?: boolean;
};

type AddressStateFieldProps = Pick<
    AddressFormProps,
    'stateOptions' | 'shouldDisplayCountrySelector' | 'stateSelectorLabel' | 'stateSelectorModalHeaderTitle' | 'stateSelectorSearchInputTitle'
>;

/** Lists Canadian provinces once Canada is picked, so it reads the picked country from the address */
function AddressStateField({stateOptions, shouldDisplayCountrySelector, stateSelectorLabel, stateSelectorModalHeaderTitle, stateSelectorSearchInputTitle}: AddressStateFieldProps) {
    const {country} = useAddressFields();
    return (
        <AddressFields.State
            optionsList={stateOptions ?? (shouldDisplayCountrySelector && country === CONST.COUNTRY.CA ? CANADIAN_PROVINCES : US_STATES)}
            label={stateSelectorLabel}
            modalHeaderTitle={stateSelectorModalHeaderTitle}
            searchInputTitle={stateSelectorSearchInputTitle}
        />
    );
}

/** Every part of an address, with the state and country picked on pages of their own */
function AddressFormFields({
    shouldSaveDraft = false,
    defaultValues,
    values,
    errors,
    inputKeys,
    streetTranslationKey,
    containerStyles,
    cityContainerStyles,
    shouldDisplayCountrySelector = false,
    shouldDisplayStateSelector = true,
    stateSelectorLabel,
    stateSelectorModalHeaderTitle,
    stateSelectorSearchInputTitle,
    stateOptions,
    shouldKeepStateCode = false,
    onCountryChange,
    shouldAllowCountryChange = true,
    forwardedFSClass,
}: AddressFormProps) {
    return (
        <AddressFields.Provider
            inputKeys={inputKeys}
            defaultValues={defaultValues}
            values={values}
            errors={errors}
            shouldSaveDraft={shouldSaveDraft}
            onCountryChange={onCountryChange}
            forwardedFSClass={forwardedFSClass}
        >
            <View style={containerStyles}>
                <AddressFields.Street
                    translationKey={streetTranslationKey}
                    shouldKeepStateCode={shouldKeepStateCode}
                    limitSearchesToCountry={shouldAllowCountryChange ? undefined : defaultValues?.country}
                />
                <AddressFields.City containerStyles={cityContainerStyles} />
                {shouldDisplayStateSelector && (
                    <AddressStateField
                        stateOptions={stateOptions}
                        shouldDisplayCountrySelector={shouldDisplayCountrySelector}
                        stateSelectorLabel={stateSelectorLabel}
                        stateSelectorModalHeaderTitle={stateSelectorModalHeaderTitle}
                        stateSelectorSearchInputTitle={stateSelectorSearchInputTitle}
                    />
                )}
                <AddressFields.ZipCode />
                {shouldDisplayCountrySelector && <AddressFields.Country shouldAllowChange={shouldAllowCountryChange} />}
            </View>
        </AddressFields.Provider>
    );
}

export default AddressFormFields;
export type {AddressInputKeys};

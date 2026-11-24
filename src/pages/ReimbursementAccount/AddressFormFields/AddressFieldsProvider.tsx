/** Shares the form keys, answers and picked country of an address with the inputs that draw its parts */
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';

import type {ReactNode} from 'react';

import React, {createContext, useContext, useState} from 'react';

import type {AddressErrors, AddressInputKeys} from './types';

type AddressFieldsContextValue = ForwardedFSClassProps & {
    inputKeys: AddressInputKeys;
    defaultValues?: Address;
    values?: Address;
    errors?: AddressErrors;
    shouldSaveDraft: boolean;

    /** The country the address is in right now, which picks the states listed and the zip code format shown */
    country: Country;

    /** Records a country picked from the country list or found by the address search */
    changeCountry: (country: unknown) => void;
};

type AddressFieldsProviderProps = ForwardedFSClassProps & {
    /** Form keys each part of the address is stored under */
    inputKeys: AddressInputKeys;

    defaultValues?: Address;
    values?: Address;

    /** Any errors that can arise from form validation */
    errors?: AddressErrors;

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft?: boolean;

    /** Called with each country the address search or the country row reports, and with '' when the country row clears the state */
    onCountryChange?: (country: unknown) => void;

    children: ReactNode;
};

const AddressFieldsContext = createContext<AddressFieldsContextValue | null>(null);

function isCountry(country: string): country is Country {
    return country in CONST.ALL_COUNTRIES;
}

function AddressFieldsProvider({inputKeys, defaultValues, values, errors, shouldSaveDraft = false, onCountryChange, forwardedFSClass, children}: AddressFieldsProviderProps) {
    const defaultCountry = defaultValues?.country === '' ? CONST.COUNTRY.US : (defaultValues?.country ?? CONST.COUNTRY.US);
    const [countryInEditMode, setCountryInEditMode] = useState<Country | ''>('');

    const changeCountry = (country: unknown) => {
        if (typeof country === 'string' && isCountry(country)) {
            setCountryInEditMode(country);
        }
        onCountryChange?.(country);
    };

    const contextValue: AddressFieldsContextValue = {
        inputKeys,
        defaultValues,
        values,
        errors,
        shouldSaveDraft,
        forwardedFSClass,
        country: countryInEditMode || defaultCountry,
        changeCountry,
    };

    return <AddressFieldsContext.Provider value={contextValue}>{children}</AddressFieldsContext.Provider>;
}

/** The address an input is part of. Only inputs drawn inside AddressFieldsProvider can use it */
function useAddressFields(): AddressFieldsContextValue {
    const context = useContext(AddressFieldsContext);
    if (!context) {
        throw new Error('useAddressFields must be used inside AddressFieldsProvider');
    }
    return context;
}

export default AddressFieldsProvider;
export {useAddressFields};

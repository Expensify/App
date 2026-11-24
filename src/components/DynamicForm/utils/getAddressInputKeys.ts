import type {DynamicFormValues} from '@components/DynamicForm/types';

import {isValidZipCodeForCountry} from '@libs/ValidationUtils';

import type AddressFormFields from '@pages/ReimbursementAccount/AddressFormFields';

import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import STATES_BY_COUNTRY from '@src/CONST/STATES_BY_COUNTRY';
import type {DynamicFormAddressField} from '@src/types/onyx';

import type {ComponentProps} from 'react';

import isCountryCode from './isCountryCode';

type AddressInputKeys = ComponentProps<typeof AddressFormFields>['inputKeys'];

/**
 * Draft keys for AddressFormFields. The street is the field's own value, and an empty key tells AddressSearch to drop that part, such as the place `name`.
 * Without a `street2` key AddressSearch adds the apartment number to the street, and also writes it to a top-level `street2` draft key that no field submits.
 */
function getAddressInputKeys(fieldKey: string): Required<Pick<AddressInputKeys, 'street' | 'city' | 'state' | 'zipCode' | 'country' | 'lat' | 'lng' | 'address'>> & {name: string} {
    return {
        street: fieldKey,
        city: `${fieldKey}.city`,
        state: `${fieldKey}.state`,
        zipCode: `${fieldKey}.zipCode`,
        country: `${fieldKey}.country`,
        lat: '',
        lng: '',
        address: '',
        name: '',
    };
}

/** The picked country, or '' while none or an unknown one is picked */
function getAddressCountry(fieldKey: string, values: DynamicFormValues): Country | '' {
    const country = values[getAddressInputKeys(fieldKey).country];
    return typeof country === 'string' && isCountryCode(country) ? country : '';
}

/** The countries the picker lists by code, or undefined when the field takes every country */
function getCountryOptions(field: DynamicFormAddressField): Record<string, string> | undefined {
    if (!field.countries) {
        return undefined;
    }
    return Object.fromEntries(field.countries.filter(isCountryCode).map((code) => [code, CONST.ALL_COUNTRIES[code]]));
}

/** Whether the field takes an address in the country. No country is never allowed, so a required address still asks for one. */
function isCountryAllowed(field: DynamicFormAddressField, country: Country | ''): boolean {
    return !!country && (!field.countries || field.countries.includes(country));
}

/** The states the picker lists by code. The field's own states win, and without them the App's list for the country is used, which is the US one until a country is picked. */
function getStateOptions(field: DynamicFormAddressField, country: Country | ''): Record<string, string> | undefined {
    if (!field.states) {
        return STATES_BY_COUNTRY[country || CONST.COUNTRY.US];
    }
    if (field.states.length === 0) {
        return undefined;
    }
    return Object.fromEntries(field.states.map((state) => [state.key, state.label ?? state.key]));
}

/** The state is asked only where the picker can list the country's states */
function isStateAsked(field: DynamicFormAddressField, country: Country | ''): boolean {
    return !!getStateOptions(field, country);
}

/** The zip input shows unless the field says no zip is asked */
function isZipCodeShown(field: DynamicFormAddressField): boolean {
    return field.isZipCodeAsked !== false;
}

/** The field decides when it says whether the zip is asked. Otherwise a country whose zip format accepts an empty zip does not require one. */
function isZipCodeRequired(field: DynamicFormAddressField, country: Country | ''): boolean {
    return field.isZipCodeAsked ?? (!country || !isValidZipCodeForCountry('', country));
}

export default getAddressInputKeys;
export {getAddressCountry, getCountryOptions, getStateOptions, isCountryAllowed, isStateAsked, isZipCodeRequired, isZipCodeShown};

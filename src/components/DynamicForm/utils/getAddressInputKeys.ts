import type {DynamicFormValues} from '@components/DynamicForm/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {isValidZipCodeForCountry} from '@libs/ValidationUtils';

import type {AddressInputKeys} from '@pages/ReimbursementAccount/AddressFormFields';

import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import STATES_BY_COUNTRY from '@src/CONST/STATES_BY_COUNTRY';
import type {DynamicFormAddressField} from '@src/types/onyx';

import {getOptionLabel} from './getFieldOptions';
import isCountryCode from './isCountryCode';

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

/** Codes of the countries the field takes, or undefined when it takes every country. An empty list counts as none set, so the country picker is never empty. */
function getAllowedCountries(field: DynamicFormAddressField): string[] | undefined {
    return field.countries?.length ? field.countries : undefined;
}

/** Whether the field takes an address in the country. No country is never allowed, so a required address still asks for one. */
function isCountryAllowed(field: DynamicFormAddressField, country: Country | ''): boolean {
    const allowedCountries = getAllowedCountries(field);
    return !!country && (!allowedCountries || allowedCountries.includes(country));
}

/** The App's own state list for the country. Until a country is picked it is the US one, unless the field does not take US addresses. */
function getAppStates(field: DynamicFormAddressField, country: Country | ''): Record<string, string> | undefined {
    if (country) {
        return STATES_BY_COUNTRY[country];
    }
    return isCountryAllowed(field, CONST.COUNTRY.US) ? STATES_BY_COUNTRY[CONST.COUNTRY.US] : undefined;
}

/** The names of the states the picker lists, by code. The field's own states win, and without them the App's list for the country is used. */
function getStateOptions(field: DynamicFormAddressField, country: Country | '', translate: LocalizedTranslate): Record<string, string> | undefined {
    if (!field.states) {
        return getAppStates(field, country);
    }
    if (field.states.length === 0) {
        return undefined;
    }
    return Object.fromEntries(field.states.map((state) => [state.key, getOptionLabel(state, translate)]));
}

/** The codes of the states the picker lists, from the same list as getStateOptions */
function getStateCodes(field: DynamicFormAddressField, country: Country | ''): string[] {
    return field.states ? field.states.map((state) => state.key) : Object.keys(getAppStates(field, country) ?? {});
}

/** The state is asked only where the picker can list the country's states */
function isStateAsked(field: DynamicFormAddressField, country: Country | ''): boolean {
    return getStateCodes(field, country).length > 0;
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
export {getAddressCountry, getAllowedCountries, getStateCodes, getStateOptions, isCountryAllowed, isStateAsked, isZipCodeRequired, isZipCodeShown};

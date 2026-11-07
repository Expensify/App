import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import {US_STATES} from '@src/CONST/STATES_BY_COUNTRY';
import type {PersonalDetailsForm} from '@src/types/form';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';

type AddressType = PersonalDetailsForm | Address | undefined;

/**
 * Normalizes the address containing a country field by converting country names to country codes.
 * Handles the case where old data has "United States" instead of "US".
 */
function normalizeCountryCode(data: AddressType): AddressType {
    if (!data?.country) {
        return data;
    }

    const normalizedCountry = getCountryCode(data.country);

    if (!normalizedCountry) {
        return data;
    }

    return {
        ...data,
        country: normalizedCountry,
    };
}

function getCountryCode(countryValue: string | undefined): Country | undefined {
    for (const [code, name] of Object.entries(CONST.ALL_COUNTRIES)) {
        if (name === countryValue) {
            return code as Country;
        }
    }

    return countryValue as Country | undefined;
}

// State pickers key on codes, but stored addresses may use full state names (e.g. "California").
function resolveStateCode(stateValue: string, stateOptions: Record<string, string> = US_STATES): string {
    if (!stateValue || Object.hasOwn(stateOptions, stateValue)) {
        return stateValue;
    }
    const match = Object.entries(stateOptions).find(([, stateName]) => stateName.toLowerCase() === stateValue.toLowerCase());
    return match ? match[0] : stateValue;
}

export {normalizeCountryCode, getCountryCode, resolveStateCode};

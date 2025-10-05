import CONST from '@src/CONST';
import type {Country} from '@src/CONST';

/**
 * Normalizes the address containing a country field by converting country names to country codes.
 * Handles the case where old data has "United States" instead of "US".
 */
function normalizeCountryCode<T extends {country?: string}>(data: T | undefined): T | undefined {
    if (!data?.country) {
        return data;
    }

    const normalizedCountry = getCountryCode(data.country);
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

export {normalizeCountryCode};

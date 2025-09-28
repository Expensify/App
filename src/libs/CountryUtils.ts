import CONST from '@src/CONST';
import type {Country} from '@src/CONST';

/**
 * Converts country name to country code if needed.
 * Handles the case where old data has "United States" instead of "US".
 */
function getCountryCode(countryValue: string | undefined): Country | '' {
    if (!countryValue) {
        return '';
    }

    for (const [code, name] of Object.entries(CONST.ALL_COUNTRIES)) {
        if (name === countryValue) {
            return code as Country;
        }
    }

    return countryValue as Country;
}

/* eslint-disable import/prefer-default-export */
export {getCountryCode};

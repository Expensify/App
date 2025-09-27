import CONST from '@src/CONST';

/**
 * Converts country name to country code if needed.
 * Handles the case where old data has "United States" instead of "US".
 */
function getCountryCode(countryValue: string | undefined): string {
    if (!countryValue) {
        return '';
    }

    for (const [code, name] of Object.entries(CONST.ALL_COUNTRIES)) {
        if (name === countryValue) {
            return code;
        }
    }

    return countryValue;
}

/* eslint-disable import/prefer-default-export */
export {getCountryCode};

import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import {parsePhoneNumber} from 'awesome-phonenumber';
import ONYXKEYS from '../ONYXKEYS';

let currentUserEmail;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        // When signed out, val is undefined
        if (!val) {
            return;
        }

        currentUserEmail = val.email;
    },
});

let currentUserPersonalDetails;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS,
    callback: (val) => {
        currentUserPersonalDetails = lodashGet(val, currentUserEmail, {});
    },
});

let countryCodeByIP;
Onyx.connect({
    key: ONYXKEYS.COUNTRY_CODE,
    callback: val => countryCodeByIP = val || 1,
});

/**
 * Returns a locally converted phone number for numbers from the same region
 * and an internationally converted phone number with the country code for numbers from other regions
 *
 * @param {String} number
 * @returns {String}
 */

function formatPhoneNumber(number) {
    const parsed = parsePhoneNumber(number);
    let locale;

    if (currentUserPersonalDetails.phoneNumber) {
        locale = parsePhoneNumber(currentUserPersonalDetails.phoneNumber).countryCode;
    } else {
        locale = countryCodeByIP;
    }

    const regionCode = parsed.countryCode;

    if (regionCode === locale) {
        // replacing regular spaces for so-called "hard spaces" to avoid breaking the line on whitespace
        return parsed.number.national;
    }

    return parsed.number.international;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    formatPhoneNumber,
};

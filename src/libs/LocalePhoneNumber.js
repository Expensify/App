import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
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
    const parsedPhoneNumber = parsePhoneNumber(Str.removeSMSDomain(number));

    // return the string untouched if it's not a phone number
    if (!parsedPhoneNumber.valid) {
        return number;
    }

    let signedInUserCountryCode;

    /**
     * if there is a phone number saved in the user's personal details we format the other numbers depending on
     * the phone number's country code, otherwise we use country code based on the user's IP
     */
    if (currentUserPersonalDetails.phoneNumber) {
        signedInUserCountryCode = parsePhoneNumber(currentUserPersonalDetails.phoneNumber).countryCode;
    } else {
        signedInUserCountryCode = countryCodeByIP;
    }

    const regionCode = parsedPhoneNumber.countryCode;

    if (regionCode === signedInUserCountryCode) {
        return parsedPhoneNumber.number.national;
    }

    return parsedPhoneNumber.number.international;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    formatPhoneNumber,
};

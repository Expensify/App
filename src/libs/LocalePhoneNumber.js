import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import {parsePhoneNumber} from 'awesome-phonenumber';
import ONYXKEYS from '../ONYXKEYS';

let countryCodeByIP;
Onyx.connect({
    key: ONYXKEYS.COUNTRY_CODE,
    callback: (val) => (countryCodeByIP = val || 1),
});

/**
 * Returns a locally converted phone number for numbers from the same region
 * and an internationally converted phone number with the country code for numbers from other regions
 *
 * @param {String} number
 * @returns {String}
 */
function formatPhoneNumber(number) {
    if (!number) {
        return '';
    }

    const numberWithoutSMSDomain = Str.removeSMSDomain(number);
    const parsedPhoneNumber = parsePhoneNumber(numberWithoutSMSDomain);

    // return the string untouched if it's not a phone number
    if (!parsedPhoneNumber.valid) {
        if (parsedPhoneNumber.number && parsedPhoneNumber.number.international) {
            return parsedPhoneNumber.number.international;
        }
        return numberWithoutSMSDomain;
    }

    const regionCode = parsedPhoneNumber.countryCode;

    if (regionCode === countryCodeByIP) {
        return parsedPhoneNumber.number.national;
    }

    return parsedPhoneNumber.number.international;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    formatPhoneNumber,
};

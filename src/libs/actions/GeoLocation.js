/* eslint-disable  import/prefer-default-export  */
import Onyx from 'react-native-onyx';
import * as DeprecatedAPI from '../deprecatedAPI';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Makes a request so that we can get the current country code by the users IP address.
 */
function fetchCountryCodeByRequestIP() {
    DeprecatedAPI.GetRequestCountryCode()
        .then((data) => {
            Onyx.merge(ONYXKEYS.COUNTRY_CODE, data.countryCode || 1);
        });
}

export {
    fetchCountryCodeByRequestIP,
};

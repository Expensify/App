import Onyx from 'react-native-onyx';
import * as API from '../API';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Makes a request so that we can get the current country code by the users IP address.
 */
function fetchCountryCodeByRequestIP() {
    API.GetRequestCountryCode()
        .then((data) => {
            Onyx.merge(ONYXKEYS.COUNTRY_CODE_BY_IP, data.countryCode || 1);
        });
}

export default fetchCountryCodeByRequestIP;

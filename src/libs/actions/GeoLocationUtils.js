import Onyx from 'react-native-onyx';
import * as API from '../API';
import ONYXKEYS from '../../ONYXKEYS';

function fetchCountryCodeByRequestIP() {
    API.GetRequestCountryCode()
        .then((data) => {
            Onyx.merge(ONYXKEYS.COUNTRY_CODE_BY_IP, data.countryCode || 1);
        });
}

export default fetchCountryCodeByRequestIP;

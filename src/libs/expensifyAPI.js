import Onyx from 'react-native-onyx';
import Network from './Network';
import API from './API2';
import ONYXKEYS from '../ONYXKEYS';


let authToken;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => authToken = val ? val.authToken : null,
});

/**
 * Adds CSRF and AuthToken to our request data
 *
 * @param {Object} data
 * @returns {Object}
 */
function addAuthToken(data) {
    const request = data;

    // Concierge does not save its authToken in cookies. By not using cookies there is no overlap between the Concierge authToken
    //  and the cookie authToken that Expensify homepage uses. Hence we set api_setCookie here to false so that we don't
    // interfere with the cookie authToken that Expensify homepage uses.
    request.authToken = authToken;
    request.api_setCookie = false;
    return request;
}

const expensifyAPI = API(Network('/api.php'), {
    enhanceParameters: addAuthToken,
});

export default expensifyAPI;

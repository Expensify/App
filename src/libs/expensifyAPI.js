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

    request.authToken = authToken;
    request.api_setCookie = false;
    return request;
}

const expensifyAPI = API(Network('/api.php'), {
    enhanceParameters: addAuthToken,
});

export default expensifyAPI;

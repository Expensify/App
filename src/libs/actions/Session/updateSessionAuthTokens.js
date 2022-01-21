import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';

/**
 * @param {String} authToken
 * @param {String} encryptedAuthToken
 */
export default function updateSessionAuthTokens(authToken, encryptedAuthToken) {
    Onyx.merge(ONYXKEYS.SESSION, {authToken, encryptedAuthToken});
}

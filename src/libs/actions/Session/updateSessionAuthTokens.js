import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';

/**
 * @param {String | undefined} authToken
 * @param {String | undefined} encryptedAuthToken
 */
export default function updateSessionAuthTokens(authToken, encryptedAuthToken) {
    Onyx.merge(ONYXKEYS.SESSION, {authToken, encryptedAuthToken});
}

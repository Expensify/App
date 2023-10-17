import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';

export default function updateSessionAuthTokens(authToken?: string, encryptedAuthToken?: string) {
    Onyx.merge(ONYXKEYS.SESSION, {authToken, encryptedAuthToken});
}

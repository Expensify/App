import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

export default function updateSessionAuthTokens(authToken?: string, encryptedAuthToken?: string) {
    return Onyx.merge(ONYXKEYS.SESSION, {authToken, encryptedAuthToken, creationDate: new Date().getTime()});
}

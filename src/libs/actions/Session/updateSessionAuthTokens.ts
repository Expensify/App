import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

export default function updateSessionAuthTokens(authToken?: string, encryptedAuthToken?: string) {
    Onyx.merge(ONYXKEYS.SESSION, {authToken, encryptedAuthToken, creationDate: new Date().getTime()});
}

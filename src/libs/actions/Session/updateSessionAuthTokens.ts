import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

export default function updateSessionAuthTokens(authToken?: string, encryptedAuthToken?: string) {
    return Onyx.merge(ONYXKEYS.SESSION, {authToken, encryptedAuthToken, creationDate: new Date().getTime()});
}

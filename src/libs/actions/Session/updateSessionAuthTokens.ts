import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

export default function updateSessionAuthTokens(authToken?: string, encryptedAuthToken?: string, authTokenType?: Session['authTokenType']) {
    return Onyx.merge(ONYXKEYS.SESSION, {authToken, encryptedAuthToken, creationDate: new Date().getTime(), ...(authTokenType !== undefined ? {authTokenType} : {})});
}

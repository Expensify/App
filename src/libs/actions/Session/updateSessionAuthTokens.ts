import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

export default function updateSessionAuthTokens(authToken?: string, encryptedAuthToken?: string, authTokenType?: ValueOf<typeof CONST.AUTH_TOKEN_TYPES>) {
    return Onyx.merge(ONYXKEYS.SESSION, {authToken, encryptedAuthToken, authTokenType, creationDate: new Date().getTime()});
}

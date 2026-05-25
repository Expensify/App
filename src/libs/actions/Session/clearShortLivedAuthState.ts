import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

export default function clearShortLivedAuthState() {
    return Onyx.merge(ONYXKEYS.SESSION, {
        isAuthenticatingWithShortLivedToken: false,
        signedInWithShortLivedAuthToken: null,
        isSupportAuthTokenUsed: false,
    });
}
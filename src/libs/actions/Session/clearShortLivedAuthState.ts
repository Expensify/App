import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

export default function clearShortLivedAuthState() {
    return Promise.all([
        Onyx.merge(ONYXKEYS.SESSION, {
            signedInWithShortLivedAuthToken: null,
            isSupportAuthTokenUsed: null,
        }),
        Onyx.set(ONYXKEYS.RAM_ONLY_IS_AUTHENTICATING_WITH_SHORT_LIVED_TOKEN, false),
    ]).then(() => undefined);
}

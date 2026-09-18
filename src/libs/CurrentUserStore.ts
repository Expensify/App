import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Session email/auth-token mirror with no imports beyond Onyx. Keeps Log and light
 * consumers away from NetworkStore, which imports Log, and from
 * actions/Session, which drags the whole session layer into their import graphs.
 */
import Onyx from 'react-native-onyx';

let currentUserEmail: string | null = null;
let sessionAuthToken: string | null = null;

Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserEmail = val?.email ?? null;
        sessionAuthToken = val?.authToken ?? null;
    },
});

function getCurrentUserEmail(): string | null {
    return currentUserEmail;
}

function hasAuthToken(): boolean {
    return !!sessionAuthToken;
}

export {getCurrentUserEmail, hasAuthToken};

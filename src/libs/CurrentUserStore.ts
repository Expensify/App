import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';

/**
 * Session email, auth token and auth token type mirror with no imports beyond Onyx and CONST. Keeps Log and light
 * consumers away from NetworkStore, which imports Log, and from
 * actions/Session, which drags the whole session layer into their import graphs.
 */
import Onyx from 'react-native-onyx';

let currentUserEmail: string | null = null;
let sessionAuthToken: string | null = null;
let sessionAuthTokenType: Session['authTokenType'] | null = null;

Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserEmail = val?.email ?? null;
        sessionAuthToken = val?.authToken ?? null;
        sessionAuthTokenType = val?.authTokenType ?? null;
    },
});

function getCurrentUserEmail(): string | null {
    return currentUserEmail;
}

function hasAuthToken(): boolean {
    return !!sessionAuthToken;
}

function isAnonymousUser(): boolean {
    return sessionAuthTokenType === CONST.AUTH_TOKEN_TYPES.ANONYMOUS;
}

export {getCurrentUserEmail, hasAuthToken, isAnonymousUser};

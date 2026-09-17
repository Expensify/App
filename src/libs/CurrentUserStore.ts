import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Thin store for the current user email and auth token that has no dependencies on Log.
 * This avoids circular dependency: Log -> NetworkStore -> Log
 * Other modules can import getCurrentUserEmail from NetworkStore for convenience,
 * but Log specifically imports from here to break the cycle.
 * Navigation and other light consumers read the auth token from here instead of
 * importing actions/Session, which drags the whole session layer into their import graph.
 */
import Onyx from 'react-native-onyx';

let currentUserEmail: string | null = null;
let sessionAuthToken: string | null | undefined;

Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserEmail = val?.email ?? null;
        sessionAuthToken = val?.authToken;
    },
});

function getCurrentUserEmail(): string | null {
    return currentUserEmail;
}

function hasAuthToken(): boolean {
    return !!sessionAuthToken;
}

export {getCurrentUserEmail, hasAuthToken};

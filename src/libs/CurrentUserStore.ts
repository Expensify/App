import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Thin store for current user email that has no dependencies on Log.
 * This avoids circular dependency: Log -> NetworkStore -> Log
 * Other modules can import getCurrentUserEmail from NetworkStore for convenience,
 * but Log specifically imports from here to break the cycle.
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

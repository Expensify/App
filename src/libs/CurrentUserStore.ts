/**
 * Thin store for current user email that has no dependencies on Log.
 * This avoids circular dependency: Log -> NetworkStore -> Log
 * Other modules can import getCurrentUserEmail from NetworkStore for convenience,
 * but Log specifically imports from here to break the cycle.
 */
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

let currentUserEmail: string | null = null;

Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserEmail = val?.email ?? null;
    },
});

function getCurrentUserEmail(): string | null {
    return currentUserEmail;
}

// eslint-disable-next-line import/prefer-default-export
export {getCurrentUserEmail};

import ONYXKEYS from '@src/ONYXKEYS';

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

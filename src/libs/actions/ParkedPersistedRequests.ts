import {isClientTheLeader} from '@libs/ActiveClientManager';
import Log from '@libs/Log';
import {getAccountID} from '@libs/Network/NetworkStore';
import {flush} from '@libs/Network/SequentialQueue';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ParkedPersistedRequests, Session} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import {getAll, getOngoingRequest, save} from './PersistedRequests';
import {isReconnectFamilyRequest} from './RequestConflictUtils';

// Older parks are dropped so stale updates can't overwrite newer edits made elsewhere
const PARK_MAX_AGE_MS = 60 * 60 * 1000;

let parkedRequests: OnyxEntry<ParkedPersistedRequests>;
let currentSession: OnyxEntry<Session>;

// A park may only be restored after a signed-out SESSION has been seen, i.e. the clear actually ran
let hasSignedOutSinceParking = false;

// Set while this app session wrote the park and is waiting for the clear, so the park isn't dropped in that window
let isParkFromThisSession = false;

function restoreIfNeeded() {
    if (!currentSession?.authToken || !currentSession.accountID || !parkedRequests || !isClientTheLeader()) {
        return;
    }

    if (!hasSignedOutSinceParking && isParkFromThisSession) {
        return;
    }

    // Clear the park before re-queueing so a subsequent SESSION change can't restore it twice
    const park = parkedRequests;
    parkedRequests = undefined;
    isParkFromThisSession = false;
    Onyx.set(ONYXKEYS.PARKED_PERSISTED_REQUESTS, null);

    const parkAgeMs = Date.now() - park.parkedAt;

    if (!hasSignedOutSinceParking) {
        Log.info('[ParkedPersistedRequests] Dropped', false, {reason: 'notSignedOut', count: park.requests.length, parkAgeMs});
        return;
    }
    if (park.accountID !== currentSession.accountID) {
        Log.info('[ParkedPersistedRequests] Dropped', false, {reason: 'accountMismatch', count: park.requests.length, parkAgeMs});
        return;
    }
    if (parkAgeMs > PARK_MAX_AGE_MS) {
        Log.info('[ParkedPersistedRequests] Dropped', false, {reason: 'expired', count: park.requests.length, parkAgeMs});
        return;
    }

    Log.info('[ParkedPersistedRequests] Restored', false, {count: park.requests.length, commands: park.requests.map((request) => request.command), parkAgeMs});
    Promise.all(park.requests.map((request) => save(request))).then(() => flush());
}

// We have used connectWithoutView here as this module is strictly non-UI network logic
Onyx.connectWithoutView({
    key: ONYXKEYS.PARKED_PERSISTED_REQUESTS,
    callback: (value) => {
        parkedRequests = value ?? undefined;
        restoreIfNeeded();
    },
});

// We have used connectWithoutView here as the restore must run on sign-in regardless of which screens are mounted
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        currentSession = value;
        if (!value?.authToken) {
            hasSignedOutSinceParking = true;
        }
        restoreIfNeeded();
    },
});

/**
 * Holds the current account's queued writes across the upcoming Onyx.clear so they can be re-queued on the next sign-in.
 * The caller must preserve ONYXKEYS.PARKED_PERSISTED_REQUESTS in that clear.
 */
function parkPersistedRequests(): Promise<void> {
    const accountID = getAccountID();
    const ongoingRequest = getOngoingRequest();
    const allRequests = ongoingRequest ? [ongoingRequest, ...getAll()] : getAll();
    const requests = allRequests.filter((request) => !isReconnectFamilyRequest(request));

    // A repeated redirect after the first clear has no account or queue left, so it must not touch the existing park
    if (!accountID || requests.length === 0) {
        return Promise.resolve();
    }

    Log.info('[ParkedPersistedRequests] Parked', false, {count: requests.length});

    hasSignedOutSinceParking = false;
    isParkFromThisSession = true;
    return Onyx.set(ONYXKEYS.PARKED_PERSISTED_REQUESTS, {accountID, parkedAt: Date.now(), requests}).catch((error: unknown) => {
        Log.hmmm('[ParkedPersistedRequests] Failed to park', {error});
    });
}

export default parkPersistedRequests;

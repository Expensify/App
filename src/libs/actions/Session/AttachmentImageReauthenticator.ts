import {reconnect} from '@libs/actions/Reconnect';
import Log from '@libs/Log';
import {getIsOffline} from '@libs/NetworkState';
import reauthenticate from '@libs/Reauthentication';

import ONYXKEYS from '@src/ONYXKEYS';
import type Session from '@src/types/onyx/Session';

import Onyx from 'react-native-onyx';

let active = false;
let currentActiveSession: Session = {};
let timer: NodeJS.Timeout;
// Gives normal flows, like the Reauthentication middleware, time to refresh the session before we ask for it
const TIMING_BEFORE_RECONNECT_MS = 3500; // 3.5s

// Gives the reconnect time to bring back a new session before we sign in again
const TIMING_BEFORE_REAUTHENTICATION_MS = 10000; // 10s

// We subscribe to sessions changes
// We do not depend on updates on the UI to call the `deactivate` function
// So we can use `connectWithoutView` here.
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        if (!value || isSameSession(value) || !active) {
            return;
        }
        deactivate();
    },
});

function isSameSession(session: Session): boolean {
    return (
        currentActiveSession.authToken === session.authToken &&
        currentActiveSession.encryptedAuthToken === session.encryptedAuthToken &&
        currentActiveSession.creationDate === session.creationDate
    );
}

function deactivate() {
    active = false;
    currentActiveSession = {};
    clearInterval(timer);
}

/**
 * The reauthenticator is currently only used by attachment images and only when the current session is expired.
 * It will only reconnect, and then reauthenticate if needed, once between two receptions of different sessions from Onyx
 * @param session the current session
 * @returns
 */
function activate(session: Session) {
    if (!session || isSameSession(session) || getIsOffline()) {
        return;
    }
    currentActiveSession = session;
    active = true;
    timer = setTimeout(tryReconnect, TIMING_BEFORE_RECONNECT_MS);
}

function tryReconnect() {
    if (getIsOffline()) {
        // The image asks again once the device is back online, so it has to start over then
        deactivate();
        return;
    }
    if (!active) {
        return;
    }

    // The server sends back a new session while it still accepts this one, so SAML users aren't sent to their identity provider
    reconnect();
    timer = setTimeout(tryReauthenticate, TIMING_BEFORE_REAUTHENTICATION_MS);
}

function tryReauthenticate() {
    if (getIsOffline()) {
        deactivate();
        return;
    }
    if (!active) {
        return;
    }
    reauthenticate().catch((error) => {
        Log.hmmm('Could not reauthenticate attachment image or receipt', {error});
    });
}

export default activate;

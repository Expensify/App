import Onyx from 'react-native-onyx';
import {reauthenticate} from '@libs/Authentication';
import ONYXKEYS from '@src/ONYXKEYS';
import type Session from '@src/types/onyx/Session';

let isOffline = false;
let active = false;
let currentActiveSession: Session = {};
let timer: NodeJS.Timeout;
// the delay before requesting a reauthentication once activated
// we think in that timing a "natural" reauthentication could happen (a session expired in the carousel is the only exception)
// and we wish not to overlap and make a double reauthentication
const TIMING_BEFORE_REAUTHENTICATION_MS = 3500; // 3.5s

// We subscribe to network's online/offline status
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        if (!network) {
            return;
        }
        isOffline = !!network.shouldForceOffline || !!network.isOffline;
        // if offline we make sure of that by requesting the status 0.5s later
        if (!isOffline) {
            return;
        }
        setTimeout(() => {
            isOffline = !!network.shouldForceOffline || !!network.isOffline;
        }, 500);
    },
});

// We subscribe to sessions changes
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        if (!value || isSameSession(value) || !active) {
            return;
        }
        deactivate();
    },
});

function isSameSession(session: Session): boolean {
    return currentActiveSession.authToken === session.authToken && currentActiveSession.encryptedAuthToken === session.encryptedAuthToken;
}

function deactivate() {
    active = false;
    currentActiveSession = {};
    clearInterval(timer);
}

/**
 * the reauthenticator is currently only used by attachment images and only when the current session is expired
 * it will only request reauthentification only once between two receptions of different sessions from Onyx
 * @param session the current session
 * @returns
 */
function activate(session: Session) {
    if (!session || isSameSession(session) || isOffline) {
        return;
    }
    currentActiveSession = session;
    active = true;
    // no need to Timers.register()
    timer = setTimeout(tryReauthenticate, TIMING_BEFORE_REAUTHENTICATION_MS);
}

function tryReauthenticate() {
    if (isOffline || !active) {
        return;
    }
    reauthenticate();
}

export default activate;

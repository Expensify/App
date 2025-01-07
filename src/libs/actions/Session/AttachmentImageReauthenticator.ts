import Onyx from 'react-native-onyx';
import {reauthenticate} from '@libs/Authentication';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type Session from '@src/types/onyx/Session';

let isOffline = false;
let active = false;
let currentActiveSession: Session = {};
let timer: NodeJS.Timeout;
// The delay before requesting a reauthentication once activated
// When the session is expired we will give it this time to reauthenticate via normal flows, like the Reauthentication middleware, in an attempt to not duplicate authentication requests
// also, this is an arbitrary number so we may tweak as needed
const TIMING_BEFORE_REAUTHENTICATION_MS = 3500; // 3.5s

// We subscribe to network's online/offline status
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        if (!network) {
            return;
        }
        isOffline = !!network.shouldForceOffline || !!network.isOffline;
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
 * The reauthenticator is currently only used by attachment images and only when the current session is expired.
 * It will only request reauthentification only once between two receptions of different sessions from Onyx
 * @param session the current session
 * @returns
 */
function activate(session: Session) {
    if (!session || isSameSession(session) || isOffline) {
        return;
    }
    currentActiveSession = session;
    active = true;
    timer = setTimeout(tryReauthenticate, TIMING_BEFORE_REAUTHENTICATION_MS);
}

function tryReauthenticate() {
    if (isOffline || !active) {
        return;
    }
    reauthenticate().catch((error) => {
        Log.hmmm('Could not reauthenticate attachment image or receipt', {error});
    });
}

export default activate;

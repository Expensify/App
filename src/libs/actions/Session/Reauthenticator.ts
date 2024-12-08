import Onyx from 'react-native-onyx';
import {reauthenticate} from '@libs/Authentication';
import ONYXKEYS from '@src/ONYXKEYS';
import type Session from '@src/types/onyx/Session';

let isOffline = false;
let active = false;
let currentActiveSession: Session = {};
let timer: NodeJS.Timeout;
const TIMING_BEFORE_REAUTHENTICATION_MS = 8500; // 8.5s

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
        if (value && !isSameSession(value)) {
            if (active) {
                deactivate();
            }
        }
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
    if (!isOffline && active) {
        reauthenticate();
        return;
    }
}

export {activate};

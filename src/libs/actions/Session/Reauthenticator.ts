import Onyx from 'react-native-onyx';
import {reauthenticate} from '@libs/Authentication';
import ONYXKEYS from '@src/ONYXKEYS';
import type Session from '@src/types/onyx/Session';

let isOffline = false;
let active = false;
let currentActiveSession: Session = {};
let timer: NodeJS.Timeout;
const TIMING_BEFORE_REAUTHENTICATION_MS = 10000; // 10

// We subscribe to network's online/offline status
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        if (!network) {
            return;
        }
        isOffline = !!network.isOffline || !!network.shouldForceOffline;
    },
});

// We subscribe to sessions changes
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        console.log(`@51888 reauthenticator new session received`, value);
        if (value && !isSameSession(value)) {
            if (active) deactivate();
        }
    },
});

function isSameSession(session: Session): boolean {
    return currentActiveSession.authToken === session.authToken && currentActiveSession.encryptedAuthToken === session.encryptedAuthToken;
}

function deactivate() {
    console.log(`@51888 reauthenticator deactivating`);
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
        console.log(`@51888 reauthenticator activation requested but already active or offline`);
        return;
    }
    console.log(`@51888 reauthenticator activating`);
    currentActiveSession = session;
    active = true;
    // no need to Timers.register()
    timer = setTimeout(tryReauthenticate, TIMING_BEFORE_REAUTHENTICATION_MS);
}

function tryReauthenticate() {
    if (!isOffline && active) {
        console.log(`@51888 reauthenticator reauthenticating`);
        reauthenticate();
        return;
    }
    console.log(`@51888 reauthenticator must not reauthenticating`);
}

export {activate};

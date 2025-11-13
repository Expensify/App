import {Str} from 'expensify-common';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import {init, sendEvent, setAttribute, setAuthenticationData} from './GroupIBSdkBridge';

let sessionID: string;
let identity: string | undefined;
// We use `connectWithoutView` here since this connection only sends the new session data to the Fraud Protection backend, and doesn't need to trigger component re-renders.
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        const isAuthenticated = !!(session?.authToken ?? null);
        const newIdentity = isAuthenticated ? (session?.accountID?.toString() ?? '') : '';
        if (newIdentity !== identity) {
            identity = newIdentity;
            sessionID = typeof identity === 'string' && identity.length > 0 ? Str.guid() : '';
            setAuthenticationData(identity, sessionID);
        }
    },
});

// We use `connectWithoutView` here since this connection only sends the new email and mfa data to the Fraud Protection backend, and doesn't need to trigger component re-renders.
Onyx.connectWithoutView({
    key: ONYXKEYS.ACCOUNT,
    callback: (account) => {
        setAttribute('email', account?.primaryLogin ?? '', false, true);
        setAttribute('mfa', account?.requiresTwoFactorAuth ? '2fa_enabled' : '2fa_disabled', false, true);
        setAttribute('is_validated', account?.validated ? 'true' : 'false', false, true);
    },
});

export default {init, sendEvent, setAttribute};

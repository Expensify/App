import {Str} from 'expensify-common';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account, Session} from '@src/types/onyx';
import {init, sendEvent, setAttribute, setAuthenticationData} from './GroupIBSdkBridge';

let sessionID = Str.guid();
let lastSentIdentity: string | undefined;
let cachedAccount: OnyxEntry<Account>;
let cachedSession: OnyxEntry<Session>;

function sendAccountAttributes() {
    setAttribute('email', cachedAccount?.primaryLogin ?? '', false, true);
    setAttribute('mfa', cachedAccount?.requiresTwoFactorAuth ? '2fa_enabled' : '2fa_disabled', false, true);
    setAttribute('is_validated', cachedAccount?.validated ? 'true' : 'false', false, true);
}

function trySendToFraudProtection() {
    const isAuthenticated = !!(cachedSession?.authToken ?? null);
    const identity = isAuthenticated ? (cachedSession?.accountID?.toString() ?? '') : '';

    // Only send when the user is authenticated with a valid identity and we have account data.
    if (!isAuthenticated || !identity || !cachedAccount?.primaryLogin) {
        return;
    }

    // Always forward the latest account attributes, but only re-send identity when it changes.
    if (identity === lastSentIdentity) {
        sendAccountAttributes();
        return;
    }

    lastSentIdentity = identity;

    setAuthenticationData(identity, sessionID);
    sendAccountAttributes();
}

// Cache account data and attempt to send.
Onyx.connectWithoutView({
    key: ONYXKEYS.ACCOUNT,
    callback: (account) => {
        cachedAccount = account;
        trySendToFraudProtection();
    },
});

// Cache session data and attempt to send. On logout, generate a new sessionID for the next session.
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        const wasAuthenticated = !!(cachedSession?.authToken ?? null);
        cachedSession = session;
        const isAuthenticated = !!(session?.authToken ?? null);

        if (wasAuthenticated && !isAuthenticated) {
            sessionID = Str.guid();
            lastSentIdentity = undefined;
            cachedAccount = undefined;
            setAuthenticationData('', sessionID);
            sendAccountAttributes();
            return;
        }

        trySendToFraudProtection();
    },
});

export default {init, sendEvent, setAttribute};

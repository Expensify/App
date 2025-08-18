import {Str} from 'expensify-common';
import Onyx from 'react-native-onyx';
import getEnvironment from '@libs/Environment/getEnvironment';
import ONYXKEYS from '@src/ONYXKEYS';
import {cidMap} from './cidMap';
import {init as initFP, sendEvent, setAttribute, setAuthStatus, setIdentity, setSessionID} from './GroupIBSDKBridge';

const sessionID: string = Str.guid();
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        const isAuthenticated = !!(session?.authToken ?? null);
        setAuthStatus(isAuthenticated);
        if (isAuthenticated) {
            setIdentity(session?.accountID?.toString() ?? '');
        }
        setSessionID(sessionID);
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.ACCOUNT,
    callback: (account) => {
        setAttribute('email', account?.primaryLogin ?? '');
        setAttribute('mfa', account?.requiresTwoFactorAuth ? '2fa_enabled' : '2fa_disabled');
    },
});

async function init(): Promise<void> {
    const env = await getEnvironment();
    initFP(cidMap[env]);
}

export default {init, sendEvent};

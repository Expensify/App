import {Str} from 'expensify-common';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {getEnvironment, getOldDotEnvironmentURL} from '../Environment/Environment';

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

const cidMap: Record<string, string> = {
    [CONST.ENVIRONMENT.PRODUCTION]: 'gib-w-expensify',
    [CONST.ENVIRONMENT.STAGING]: 'gib-w-expensify-stg',
    [CONST.ENVIRONMENT.DEV]: 'gib-w-expensify-uat',
    [CONST.ENVIRONMENT.ADHOC]: 'gib-w-expensify-uat',
};

function getScriptURL(): string {
    if (typeof window === 'undefined' || typeof window.location === 'undefined') {
        return 'gib.js';
    }
    // On web, ensure we load from the origin root so deep links like /r/123 don't request /r/123/gib.js
    if (window.location.protocol !== 'file:') {
        return `${window.location.origin}/gib.js`;
    }
    // In desktop (file://) keep it relative to index.html
    return 'gib.js';
}

function loadGroupIBFP(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof document === 'undefined') {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.async = true;
        script.src = getScriptURL();
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load the gib.js script.'));
        document.head.appendChild(script);
    });
}

let resolveFpInstancePromise: (fp: any | undefined) => void = () => {};
const fpInstancePromise = new Promise<any | undefined>((resolve) => {
    resolveFpInstancePromise = resolve;
});

async function init(): Promise<void> {
    if (typeof document === 'undefined') {
        resolveFpInstancePromise(undefined);
        return;
    }
    const scriptPromise = loadGroupIBFP();
    const envPromise = getEnvironment();
    const [_, env] = await Promise.all([scriptPromise, envPromise]);
    const fp = (globalThis as any)?.window?.gib;
    const cid = cidMap[env] ?? cidMap[CONST.ENVIRONMENT.DEV];
    const oldDotURL = await getOldDotEnvironmentURL();
    fp?.init?.({cid, backUrl: `${oldDotURL.replace('https://', '//')}/api/fl`, gafUrl: '//eu.id.group-ib.com/id.html'});
    resolveFpInstancePromise(fp);
}

function setAttribute(key: string, value: string, opts?: {persist?: boolean; encryption?: unknown}) {
    fpInstancePromise.then((fp) => {
        fp?.setAttribute?.(key, value, opts);
    });
}

function sendEvent(event: string, persist = false, encryption: unknown = null) {
    setAttribute('event_type', event, {persist, encryption: encryption ?? undefined});
}

function setAuthStatus(isLoggedIn: boolean) {
    fpInstancePromise.then((fp) => {
        const status = isLoggedIn ? fp?.IS_AUTHORIZED : fp?.IS_GUEST;
        fp?.setAuthStatus?.(status);
    });
}

function setSessionID(id: string) {
    fpInstancePromise.then((fp) => {
        fp?.setSessionID?.(id);
    });
}

function setIdentity(id: string) {
    fpInstancePromise.then((fp) => {
        fp?.setIdentity?.(id);
    });
}

const GroupIBFPUtils = {
    init,
    setAttribute,
    sendEvent,
    setAuthStatus,
    setSessionID,
    setIdentity,
};

export default GroupIBFPUtils;

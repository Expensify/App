import {getEnvironment, getOldDotEnvironmentURL} from '@libs/Environment/Environment';
import CONST from '@src/CONST';
import cidMap from './cidMap';

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

function loadGroupIBScript(): Promise<void> {
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

let resolveFpInstancePromise: (fp: any) => void = () => {};
const fpInstancePromise = new Promise<any>((resolve) => {
    resolveFpInstancePromise = resolve;
});

function init(): Promise<void> {
    if (typeof document === 'undefined') {
        resolveFpInstancePromise(undefined);
        return Promise.resolve();
    }
    return Promise.all([loadGroupIBScript(), getEnvironment(), getOldDotEnvironmentURL()]).then(([_, env, oldDotURL]) => {
        const fp = (globalThis as any)?.window?.gib;
        const cid = cidMap[env] ?? cidMap[CONST.ENVIRONMENT.DEV];
        fp?.init?.({cid, backUrl: `${oldDotURL.replace('https://', '//')}/api/fl`, gafUrl: '//eu.id.group-ib.com/id.html'});
        resolveFpInstancePromise(fp);
    });
}

function setAuthenticationData(identity: string, sessionID: string): void {
    fpInstancePromise.then((fp) => {
        const status = identity !== '' ? fp?.IS_AUTHORIZED : fp?.IS_GUEST;
        fp?.setAuthStatus?.(status);
        fp?.setIdentity?.(identity);
        fp?.setSessionID?.(sessionID);
    });
}

function setAttribute(key: string, value: string, opts?: {persist?: boolean; encryption?: unknown}) {
    fpInstancePromise.then((fp) => {
        fp?.setAttribute?.(key, value, opts);
    });
}

function sendEvent(event: string, persist = false, encryption: unknown = null) {
    setAttribute('event_type', event, {persist, encryption: encryption ?? undefined});
}

export {init, sendEvent, setAttribute, setAuthenticationData};

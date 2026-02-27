import {getOldDotEnvironmentURL} from '@libs/Environment/Environment';
import getEnvironment from '@libs/Environment/getEnvironment';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import cidMap from './cidMap';
import getScriptURL from './getScriptURL';

type GibSdk = {
    init: (opts: {cid: string; backUrl: string; gafUrl: string}) => void;
    setAttribute?: (key: string, value: string, opts?: {persist?: boolean; encryption?: unknown}) => void;
    setAuthStatus?: (status: number) => void;
    setIdentity?: (id: string | number) => void;
    setSessionID?: (id: string) => void;
    IS_AUTHORIZED?: number;
    IS_GUEST?: number;
};

type WindowWithGib = typeof window & {gib?: GibSdk};

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
        script.onerror = () => {
            Log.warn('[Fraud Protection] Failed to load the gib.js script.');
            reject(new Error('Failed to load the gib.js script.'));
        };
        document.head.appendChild(script);
    });
}

let resolveFpInstancePromise: (fp: GibSdk | undefined) => void = () => {};
const fpInstancePromise = new Promise<GibSdk | undefined>((resolve) => {
    resolveFpInstancePromise = resolve;
});

function init(): Promise<void> {
    if (typeof document === 'undefined') {
        resolveFpInstancePromise(undefined);
        return Promise.resolve();
    }
    return Promise.all([getEnvironment(), getOldDotEnvironmentURL(), loadGroupIBScript()]).then(([env, oldDotURL]) => {
        const fp = (window as WindowWithGib).gib;
        const cid = cidMap[env] ?? cidMap[CONST.ENVIRONMENT.DEV];
        fp?.init?.({cid, backUrl: `${oldDotURL.replace('https://', '//')}/api/fl`, gafUrl: '//eu.id.group-ib.com/id.html'});
        resolveFpInstancePromise(fp);
    });
}

function setAuthenticationData(identity: string, sessionID: string): void {
    fpInstancePromise.then((fp) => {
        const status = identity !== '' ? fp?.IS_AUTHORIZED : fp?.IS_GUEST;
        // The order of these calls is important. Do not change it unless you check in the GroupIB SDK documentation.
        fp?.setAuthStatus?.(status ?? 0);
        fp?.setIdentity?.(identity);
        fp?.setSessionID?.(sessionID);
    });
}

function setAttribute(key: string, value: string, shouldHash?: boolean, persist?: boolean) {
    fpInstancePromise.then((fp) => {
        const options: {persist?: boolean; encryption?: string} = {persist: persist === true};
        if (shouldHash) {
            options.encryption = 'sha1';
        }
        fp?.setAttribute?.(key, value, options);
    });
}

function sendEvent(event: string) {
    setAttribute('event_type', event);
}

export {init, sendEvent, setAttribute, setAuthenticationData};

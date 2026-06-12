import {FP, FPAttributeFormat} from 'group-ib-fp';
import {getApiRoot} from '@libs/ApiUtils';
import {getOldDotEnvironmentURL} from '@libs/Environment/Environment';
import getEnvironment from '@libs/Environment/getEnvironment';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import enableCapabilities from './enableCapabilities/index';

// The GroupIB SDK requires us to set both iOS and Android customer IDs when initializing the SDK, instead of just one that the App is running on.
const cidIOSMap: Record<string, string> = {
    [CONST.ENVIRONMENT.PRODUCTION]: 'gib-i-expensify',
    [CONST.ENVIRONMENT.STAGING]: 'gib-i-expensify-stg',
    [CONST.ENVIRONMENT.DEV]: 'gib-i-expensify-uat',
    [CONST.ENVIRONMENT.ADHOC]: 'gib-i-expensify-stg',
};
const cidAndroidMap: Record<string, string> = {
    [CONST.ENVIRONMENT.PRODUCTION]: 'gib-a-expensify',
    [CONST.ENVIRONMENT.STAGING]: 'gib-a-expensify-stg',
    [CONST.ENVIRONMENT.DEV]: 'gib-a-expensify-uat',
    [CONST.ENVIRONMENT.ADHOC]: 'gib-a-expensify-stg',
};

let resolveFpInstancePromise: (fp: FP) => void = () => {};
const fpInstancePromise = new Promise<FP>((resolve) => {
    resolveFpInstancePromise = resolve;
});

/** Required configuration to initialize the FraudProtection SDK on native.
 * This block must execute in the order below so the SDK has all identifiers and endpoints before it starts:
 *  1) Set platform customer IDs (iOS/Android)
 *  2) Set collection endpoints (target URL and GlobalId URL)
 *  3) Enable platform capabilities
 *  4) Start the SDK (run)
 */
function init(): Promise<void> {
    return Promise.all([getEnvironment(), getOldDotEnvironmentURL()]).then(([env, oldDotURL]) => {
        const iOSCustomerID = cidIOSMap[env] ?? cidIOSMap[CONST.ENVIRONMENT.DEV];
        const androidCustomerID = cidAndroidMap[env] ?? cidAndroidMap[CONST.ENVIRONMENT.DEV];

        const fp = FP.getInstance();

        let targetBaseURL = oldDotURL;
        if (env === CONST.ENVIRONMENT.DEV) {
            targetBaseURL = getApiRoot();
            Log.info(`[Fraud Protection] Fraud protection backend URL: ${targetBaseURL}`);
            fp.enableDebugLogs();
        }

        // Set platform-specific customer IDs – It's weird but their documentation requires us to set both of them instead of just one that the App is running on.
        fp.setCustomerId(iOSCustomerID, androidCustomerID, (error: string) => {
            Log.warn(`[Fraud Protection] setCustomerId error: ${error}`);
        });

        targetBaseURL = targetBaseURL.endsWith('/') ? targetBaseURL.slice(0, -1) : targetBaseURL;
        fp.setTargetURL(`${targetBaseURL}/api/fl`, (error: string) => {
            Log.warn(`[Fraud Protection] setTargetURL error: ${error}`);
        });
        fp.setGlobalIdURL(`${targetBaseURL}/api/fl/id.html`, (error: string) => {
            Log.warn(`[Fraud Protection] setGlobalIdURL error: ${error}`);
        });

        enableCapabilities(fp);

        fp.run((error: string) => {
            Log.warn(`[Fraud Protection] run error: ${error}`);
        });

        resolveFpInstancePromise(fp);
    });
}

function setAuthenticationData(identity: string, sessionID: string): void {
    fpInstancePromise.then((fp) => {
        fp.setAttributeTitle('user_id', identity, FPAttributeFormat.ClearText, false, (e: string) => {
            Log.warn(`[Fraud Protection] setAttributeTitle('user_id', [REDACTED], FPAttributeFormat.ClearText) error: ${e}`);
        });
        fp.setSessionId(sessionID, (e: string) => {
            Log.warn(`[Fraud Protection] setSessionId([REDACTED]) error: ${e}`);
        });
    });
}

function setAttribute(key: string, value: string, shouldHash?: boolean, persist?: boolean): void {
    fpInstancePromise.then((fp) => {
        const format = shouldHash ? FPAttributeFormat.Hashed : FPAttributeFormat.ClearText;
        const sendOnceOnly = persist !== true;
        fp.setAttributeTitle(key, value, format, sendOnceOnly, (e: string) => {
            const formatName = shouldHash ? 'FPAttributeFormat.Hashed' : 'FPAttributeFormat.ClearText';
            Log.warn(`[Fraud Protection] setAttributeTitle(${key}, [REDACTED], ${formatName}) error: ${e}`);
        });
    });
}

function sendEvent(event: string): void {
    setAttribute('event_type', event);
}

export {init, sendEvent, setAttribute, setAuthenticationData};

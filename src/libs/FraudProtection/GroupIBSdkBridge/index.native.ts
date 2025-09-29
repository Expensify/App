import {FP, FPAttributeFormat} from 'group-ib-fp';
import {getEnvironment, getOldDotEnvironmentURL} from '@libs/Environment/Environment';
import Log from '@libs/Log';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import enableCapabilities from './enableCapabilities/index';

// The GroupIB SDK requires us to set both iOS and Android customer IDs when initializing the SDK, instead of just one that the App is running on.
const cidIOSMap: Record<string, string> = {
    [CONST.ENVIRONMENT.PRODUCTION]: 'gib-i-expensify',
    [CONST.ENVIRONMENT.STAGING]: 'gib-i-expensify-stg',
    [CONST.ENVIRONMENT.DEV]: 'gib-i-expensify-uat',
    [CONST.ENVIRONMENT.ADHOC]: 'gib-i-expensify-uat',
};
const cidAndroidMap: Record<string, string> = {
    [CONST.ENVIRONMENT.PRODUCTION]: 'gib-a-expensify',
    [CONST.ENVIRONMENT.STAGING]: 'gib-a-expensify-stg',
    [CONST.ENVIRONMENT.DEV]: 'gib-a-expensify-uat',
    [CONST.ENVIRONMENT.ADHOC]: 'gib-a-expensify-uat',
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

        let targetBaseURL;
        if (env === CONST.ENVIRONMENT.DEV) {
            targetBaseURL = CONFIG.EXPENSIFY.DEFAULT_API_ROOT;
            fp.enableDebugLogs();
        }

        // Set platform-specific customer IDs – It's weird but their documentation requires us to set both of them instead of just one that the App is running on.
        fp.setCustomerId(iOSCustomerID, androidCustomerID, (error: string) => {
            Log.warn(`[Fraud Protection] setCustomerId error: ${error}`);
        });

        targetBaseURL = oldDotURL.endsWith('/') ? oldDotURL.slice(0, -1) : oldDotURL;
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
        fp.setAttributeTitle('user_id', identity, FPAttributeFormat.ClearText, (e: string) => {
            Log.warn(`[Fraud Protection] setAttributeTitle error: ${e}`);
        });
        fp.setSessionId(sessionID, (e: string) => {
            Log.warn(`[Fraud Protection] setSessionId error: ${e}`);
        });
    });
}

function setAttribute(key: string, value: string, shouldHash?: boolean): void {
    fpInstancePromise.then((fp) => {
        const format = shouldHash ? FPAttributeFormat.Hashed : FPAttributeFormat.ClearText;
        fp.setAttributeTitle(key, value, format);
    });
}

function sendEvent(event: string): void {
    setAttribute('event_type', event);
}

export {init, sendEvent, setAttribute, setAuthenticationData};

import {FP, FPAttributeFormat} from 'group-ib-fp';
import {getEnvironment, getOldDotEnvironmentURL} from '@libs/Environment/Environment';
import Log from '@libs/Log';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import enableCapabilities from './enableCapabilities/index';

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

function setAttribute(key: string, value: string): void {
    fpInstancePromise.then((fp) => {
        fp.setAttributeTitle(key, value, FPAttributeFormat.ClearText);
    });
}

function sendEvent(event: string): void {
    setAttribute('event_type', event);
}

export {init, sendEvent, setAttribute, setAuthenticationData};

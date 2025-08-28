import {FP, FPAttributeFormat} from 'group-ib-fp';
import {getEnvironment, getOldDotEnvironmentURL} from '@libs/Environment/Environment';
import CONST from '@src/CONST';
import enableCapabilities from './enableCapabilities/index';
import CONFIG from '@src/CONFIG';

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
        console.log(`[Fraud Protection] FP.getInstance()`);
        
        if (env === CONST.ENVIRONMENT.DEV) {
            console.log(`[Fraud Protection] FP.enableDebugLogs()`);
            oldDotURL = CONFIG.EXPENSIFY.DEFAULT_API_ROOT;
            fp.enableDebugLogs();
        }
        
        console.log(`[Fraud Protection] FP.setCustomerId(${iOSCustomerID}, ${androidCustomerID})`);
        fp.setCustomerId(iOSCustomerID, androidCustomerID, (error: string) => {
            console.log(`[Fraud Protection] setCustomerId error: ${error}`);
        });
        
        oldDotURL = oldDotURL.endsWith('/') ? oldDotURL.slice(0, -1) : oldDotURL;
        console.log(`[Fraud Protection] FP.setTargetURL(${oldDotURL}/api/fl)`);
        fp.setTargetURL(`${oldDotURL}/api/fl`, (error: string) => {
            console.log(`[Fraud Protection] setTargetURL error: ${error}`);
        });

        console.log(`[Fraud Protection] FP.setGlobalIdURL(${oldDotURL}/api/fl/id.html)`);
        fp.setGlobalIdURL(`${oldDotURL}/api/fl/id.html`, (error: string) => {
            console.log(`[Fraud Protection] setGlobalIdURL error: ${error}`);
        });
        
        console.log(`[Fraud Protection] enableCapabilities()`);
        enableCapabilities(fp);
        
        console.log(`[Fraud Protection] FP.run()`);
        fp.run((error: string) => {
            console.log(`[Fraud Protection] run error: ${error}`);
        });
        
        resolveFpInstancePromise(fp);
    });
}

function setAuthenticationData(identity: string, sessionID: string): void {
    fpInstancePromise.then((fp) => {
        console.log(`[Fraud Protection] setAttributeTitle('user_id', ${identity}, FPAttributeFormat.ClearText)`);
        fp.setAttributeTitle('user_id', identity, FPAttributeFormat.ClearText, (e: any) => { 
            console.log(`[Fraud Protection] setAttributeTitle error: ${e}`);
        });
        console.log(`[Fraud Protection] FP.setSessionId(${sessionID})`);
        fp.setSessionId(sessionID, (e: any) => {
            console.log(`[Fraud Protection] setSessionId error: ${e}`);
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

import {FP, FPAttributeFormat} from 'group-ib-fp';
import {getEnvironment, getOldDotEnvironmentURL} from '@libs/Environment/Environment';
import CONST from '@src/CONST';

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
        fp.setCustomerId(iOSCustomerID, androidCustomerID);
        fp.setTargetURL(`${oldDotURL}/api/fl`);
        fp.run();
        resolveFpInstancePromise(fp);
    });
}

function setAuthenticationData(identity: string, sessionID: string): void {
    fpInstancePromise.then((fp) => {
        fp.setAttributeTitle('user_id', identity, FPAttributeFormat.ClearText);
        fp.setSessionId(sessionID);
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

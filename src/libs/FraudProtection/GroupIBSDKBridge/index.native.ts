import {AndroidCapability, Capability, FP, FPAttributeFormat} from 'group-ib-fp';
import {getEnvironment, getOldDotEnvironmentURL} from '@libs/Environment/Environment';
import CONST from '@src/CONST';

const fp = FP.getInstance();

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

async function init(cid: string): Promise<void> {
    fp.init();
    const env = await getEnvironment();
    const iOSCustomerID = cidIOSMap[env] ?? cidIOSMap[CONST.ENVIRONMENT.DEV];
    const androidCustomerID = cidAndroidMap[env] ?? cidAndroidMap[CONST.ENVIRONMENT.DEV];
    fp.setCustomerID(iOSCustomerID, androidCustomerID);
    const oldDotURL = await getOldDotEnvironmentURL();
    fp.setTargetURL(`${oldDotURL}/api/fl`);
}

function setAttribute(key: string, value: string): void {
    fp.setAttribute(key, value);
}

function sendEvent(event: string): void {
    fp.sendEvent(event);
}

function setAuthStatus(status: string): void {
    fp.setAuthStatus(status);
}

function setSessionID(id: string): void {
    fp.setSessionID(id);
}

function setIdentity(id: string): void {
    fp.setIdentity(id);
}

export default {
    init,
    setAttribute,
    sendEvent,
    setAuthStatus,
    setSessionID,
    setIdentity,
};

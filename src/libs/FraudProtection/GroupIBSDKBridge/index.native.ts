import {AndroidCapability, Capability, FP, FPAttributeFormat} from 'group-ib-fp';

const fp = FP.getInstance();

function init(cid: string): void {
    fp.init();
    fp.setCustomerID(cid);
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

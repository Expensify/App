import {FP, Capability, AndroidCapability, FPAttributeFormat} from 'group-ib-fp';

const fp = FP.getInstance();

function init(): void {
    fp.init();
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

const GroupIBFPUtils = {
    init,
    setAttribute,
    sendEvent,
    setAuthStatus,
    setSessionID,
    setIdentity,
};
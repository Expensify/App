import Log from '@libs/Log';

function logCapability(capabilityName: string, e: string, isRun: boolean) {
    Log.warn(`[Fraud Protection] enableCapability(${capabilityName})`, {error: e, isRun});
}

export default logCapability;

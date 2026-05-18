import Log from '@libs/Log';

function logCapability(capabilityName: string, e: string, isRun: boolean) {
    if (e !== null && e !== undefined && e !== '') {
        Log.warn(`[Fraud Protection] ${capabilityName} capability error: ${e}`);
        return;
    }

    Log.info(`[Fraud Protection] ${capabilityName} capability status: ${isRun ? 'Enabled' : 'Disabled'}`);
}

export default logCapability;

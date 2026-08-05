import Log from '@libs/Log';

import type {MFARegistrationStateSnapshot} from './trackMFAFlowOutcome';

type MFAFlowStartContext = {
    scenario: string;
    isOffline: boolean;
    registrationState: MFARegistrationStateSnapshot;
};

function trackMFAFlowStart(context: MFAFlowStartContext): void {
    const extra = {
        scenario: context.scenario,
        isOffline: context.isOffline,
        ...context.registrationState,
    };

    Log.info('[MFA] Flow started', false, {mfa: extra});
}

export default trackMFAFlowStart;

import Log from '@libs/Log';
import type {CredentialsState} from './trackMFAFlowOutcome';

type MFAFlowStartContext = {
    scenario: string;
    isOffline: boolean;
    credentialsState: CredentialsState;
};

function trackMFAFlowStart(context: MFAFlowStartContext): void {
    const extra = {
        scenario: context.scenario,
        isOffline: context.isOffline,
        ...context.credentialsState,
    };

    Log.info('[MFA] Flow started', false, {mfa: extra});
}

export default trackMFAFlowStart;

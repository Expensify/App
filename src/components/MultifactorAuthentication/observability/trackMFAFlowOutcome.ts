import * as Sentry from '@sentry/react-native';
import type {MultifactorAuthenticationScenarioResponse} from '@components/MultifactorAuthentication/config/types';
import type {ErrorState} from '@components/MultifactorAuthentication/Context/types';
import Log from '@libs/Log';
import type {AuthTypeName, MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';

type FailureClassification = 'routine' | 'anomalous' | 'unclassified';

function classifyFailure(reason: MultifactorAuthenticationReason | undefined): FailureClassification {
    if (!reason) {
        return 'unclassified';
    }
    if (CONST.MULTIFACTOR_AUTHENTICATION.ROUTINE_FAILURES.has(reason)) {
        return 'routine';
    }
    if (CONST.MULTIFACTOR_AUTHENTICATION.ANOMALOUS_FAILURES.has(reason)) {
        return 'anomalous';
    }
    return 'unclassified';
}

type MFAFlowOutcomeContext = {
    isSuccessful: boolean;
    scenario: string | undefined;
    scenarioResponse: MultifactorAuthenticationScenarioResponse | undefined;
    error: ErrorState | undefined;
    authenticationMethod: AuthTypeName | undefined;
    isRegistrationComplete: boolean;
    isAuthorizationComplete: boolean;
    softPromptApproved: boolean;
};

function trackMFAFlowOutcome(context: MFAFlowOutcomeContext): void {
    try {
        const failureClassification = context.isSuccessful ? undefined : classifyFailure(context.error?.reason);

        const tags: Record<string, string> = {};
        if (context.scenario) {
            tags[CONST.TELEMETRY.TAG_MFA_SCENARIO] = context.scenario;
        }
        if (!context.isSuccessful && context.error?.reason) {
            tags[CONST.TELEMETRY.TAG_MFA_ERROR_REASON] = context.error.reason;
        }

        const eventMessage = context.isSuccessful ? 'MFA Flow Success' : `MFA Flow Error: ${context.error?.reason ?? ''}`;
        const level = context.isSuccessful || failureClassification === 'routine' ? 'info' : 'error';

        const extra = {
            isSuccessful: context.isSuccessful,
            scenario: context.scenario,
            scenarioResponse: {
                reason: context.scenarioResponse?.reason,
                httpStatusCode: context.scenarioResponse?.httpStatusCode,
                message: context.scenarioResponse?.message,
            },
            error: {
                reason: context.error?.reason,
                httpStatusCode: context.error?.httpStatusCode,
                message: context.error?.message,
            },
            failureClassification,
            authenticationMethod: context.authenticationMethod,
            isRegistrationComplete: context.isRegistrationComplete,
            isAuthorizationComplete: context.isAuthorizationComplete,
            softPromptApproved: context.softPromptApproved,
            timestamp: Date.now(),
        };

        Sentry.captureMessage(eventMessage, {
            level,
            tags,
            extra,
            fingerprint: ['mfa-flow-outcome', context.isSuccessful ? 'success' : 'error', context.error?.reason ?? context.scenarioResponse?.reason ?? 'unknown'],
        });

        if (level === 'error') {
            Log.hmmm(`[MFA] ${eventMessage}`, extra);
        } else {
            Log.info(`[MFA] ${eventMessage}`, false, extra);
        }
    } catch (sentryError) {
        Log.warn('[trackMFAFlowOutcome] Failed to track MFA flow outcome', {sentryError, originalContext: context});
    }
}

export default trackMFAFlowOutcome;

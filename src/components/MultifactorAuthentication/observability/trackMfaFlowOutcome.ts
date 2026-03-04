import * as Sentry from '@sentry/react-native';
import Log from '@libs/Log';
import type {AuthTypeName, MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';

const EXPECTED_FAILURE_REASONS = new Set<MultifactorAuthenticationReason>([
    CONST.MULTIFACTOR_AUTHENTICATION.REASON.EXPO.CANCELED,
    CONST.MULTIFACTOR_AUTHENTICATION.REASON.EXPO.NO_METHOD_AVAILABLE,
    CONST.MULTIFACTOR_AUTHENTICATION.REASON.EXPO.NOT_SUPPORTED,
    CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.CANCELED,
    CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.NO_ELIGIBLE_METHODS,
    CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.UNSUPPORTED_DEVICE,
    CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.TRANSACTION_EXPIRED,
    CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.TRANSACTION_DENIED,
    CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.TOO_MANY_ATTEMPTS,
    CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.INVALID_VALIDATE_CODE,
    CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.REGISTRATION_REQUIRED,
    CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.KEY_MISSING,
    CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.KEY_NOT_FOUND,
    CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.REGISTRATION_REQUIRED,
]);

type MfaFlowOutcomeContext = {
    isSuccessful: boolean;
    scenario: string | undefined;
    reason: MultifactorAuthenticationReason | undefined;
    httpStatusCode: number | undefined;
    message: string | undefined;
    authenticationMethod: AuthTypeName | undefined;
    isRegistrationComplete: boolean;
    isAuthorizationComplete: boolean;
    softPromptApproved: boolean;
};

function trackMfaFlowOutcome(context: MfaFlowOutcomeContext): void {
    try {
        const isExpectedFailure = !context.isSuccessful && context.reason !== undefined && EXPECTED_FAILURE_REASONS.has(context.reason);

        const tags: Record<string, string> = {};
        if (context.scenario) {
            tags[CONST.TELEMETRY.TAG_MFA_SCENARIO] = context.scenario;
        }
        if (!context.isSuccessful && context.reason) {
            tags[CONST.TELEMETRY.TAG_MFA_ERROR_REASON] = context.reason;
        }

        const eventMessage = context.isSuccessful ? 'MFA Flow Success' : `MFA Flow Error: ${context.reason ?? 'unknown'}`;
        const level = context.isSuccessful || isExpectedFailure ? 'info' : 'error';

        const extra = {
            isSuccessful: context.isSuccessful,
            scenario: context.scenario,
            reason: context.reason,
            httpStatusCode: context.httpStatusCode,
            message: context.message,
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
        });

        if (level === 'error') {
            Log.hmmm(`[MFA] ${eventMessage}`, extra);
        } else {
            Log.info(`[MFA] ${eventMessage}`, false, extra);
        }
    } catch (sentryError) {
        Log.warn('[trackMfaFlowOutcome] Failed to track MFA flow outcome', {sentryError, originalContext: context});
    }
}

export default trackMfaFlowOutcome;

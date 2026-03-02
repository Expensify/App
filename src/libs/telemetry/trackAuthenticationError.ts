import * as Sentry from '@sentry/react-native';
import CONST from '@src/CONST';

type AuthenticationFunction = 'Authenticate' | 'reauthenticate';
type AuthenticationErrorType = 'missing_params' | 'network_retry' | 'auth_failure' | 'unexpected_error';

type AuthenticationErrorContext = {
    errorType: AuthenticationErrorType;
    functionName: AuthenticationFunction;
    jsonCode?: number | string;
    command?: string;
    commandName?: string;
    errorMessage?: string;
    providedParameters?: string[];
};

/**
 * Track authentication errors in Sentry with extra context.
 *
 * @param error - The error object to capture
 * @param context - Additional context about the authentication error
 */
function trackAuthenticationError(error: Error, context: AuthenticationErrorContext): void {
    const {errorType, functionName, jsonCode, command, commandName, errorMessage, providedParameters} = context;

    const tags: Record<string, string> = {
        [CONST.TELEMETRY.TAG_AUTHENTICATION_FUNCTION]: functionName,
        [CONST.TELEMETRY.TAG_AUTHENTICATION_ERROR_TYPE]: errorType,
    };

    if (jsonCode !== undefined) {
        tags[CONST.TELEMETRY.TAG_AUTHENTICATION_JSON_CODE] = String(jsonCode);
    }

    const extra: Record<string, unknown> = {
        ...(command && {command}),
        ...(commandName && {commandName}),
        ...(errorMessage && {errorMessage}),
        ...(providedParameters && {providedParameters}),
    };

    Sentry.captureException(error, {tags, extra});
}

export default trackAuthenticationError;

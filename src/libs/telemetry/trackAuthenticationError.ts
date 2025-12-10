import * as Sentry from '@sentry/react-native';

type AuthenticationFunction = 'Authenticate' | 'reauthenticate';
type AuthenticationErrorType = 'missing_params' | 'network_retry' | 'auth_failure';

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
 * Track authentication errors in Sentry with consistent tagging and context.
 *
 * @param error - The error object to capture
 * @param context - Additional context about the authentication error
 */
function trackAuthenticationError(error: Error, context: AuthenticationErrorContext): void {
    const {errorType, functionName, jsonCode, command, commandName, errorMessage, providedParameters} = context;

    const tags: Record<string, string> = {
        'authentication.function': functionName,
        'authentication.error_type': errorType,
    };

    if (jsonCode !== undefined) {
        tags['authentication.json_code'] = String(jsonCode);
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

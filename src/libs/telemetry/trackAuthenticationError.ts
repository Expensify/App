import type {AUTHENTICATION_COMMAND} from '@libs/API/types';

import CONST from '@src/CONST';

import * as Sentry from '@sentry/react-native';

type AuthenticationFunction = typeof AUTHENTICATION_COMMAND | 'reauthenticate';
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
 * Error types that are expected during normal operation, so they are forwarded as Sentry logs instead of the
 * error stream. `network_retry` is the `UNABLE_TO_RETRY` path in `Reauthentication`: the request failed on a
 * spotty connection, the user is deliberately kept signed in, and the retry mechanism handles it from there.
 */
const NON_ACTIONABLE_ERROR_TYPES = new Set<AuthenticationErrorType>(['network_retry']);

/**
 * Track authentication errors in Sentry with extra context.
 *
 * @param error - The error object to capture
 * @param context - Additional context about the authentication error
 */
function trackAuthenticationError(error: Error, context: AuthenticationErrorContext): void {
    const {errorType, functionName, jsonCode, command, commandName, errorMessage, providedParameters} = context;

    const tags: Record<string, string> = {
        [CONST.TELEMETRY.TAGS.AUTHENTICATION_FUNCTION]: functionName,
        [CONST.TELEMETRY.TAGS.AUTHENTICATION_ERROR_TYPE]: errorType,
    };

    if (jsonCode !== undefined) {
        tags[CONST.TELEMETRY.TAGS.AUTHENTICATION_JSON_CODE] = String(jsonCode);
    }

    const extra: Record<string, unknown> = {
        ...(command && {command}),
        ...(commandName && {commandName}),
        ...(errorMessage && {errorMessage}),
        ...(providedParameters && {providedParameters}),
    };

    if (NON_ACTIONABLE_ERROR_TYPES.has(errorType)) {
        Sentry.logger.warn(`[Authentication] ${errorType}`, {...tags, ...extra, errorMessage: errorMessage ?? error.message});
        return;
    }

    Sentry.captureException(error, {tags, extra});
}

export default trackAuthenticationError;

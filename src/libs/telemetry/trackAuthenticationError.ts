import type {AUTHENTICATION_COMMAND} from '@libs/API/types';
import HttpsError from '@libs/Errors/HttpsError';

import CONST from '@src/CONST';

import * as Sentry from '@sentry/react-native';

type AuthenticationFunction = typeof AUTHENTICATION_COMMAND | 'reauthenticate';
type AuthenticationErrorType = 'missing_params' | 'network_retry' | 'auth_failure' | 'unexpected_error' | 'retries_exhausted';

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
 * Authenticate response codes that sign the user out on purpose, so an `auth_failure` carrying one of them is
 * expected and goes to Sentry logs: 401, 404 and 418 reject the stored credentials, 426 means the app is outdated.
 * Only response codes count: the same status at the HTTP level (an `HttpsError`) points to an infrastructure problem.
 */
const EXPECTED_AUTH_FAILURE_JSON_CODES = new Set<number>([401, 404, 418, CONST.JSON_CODE.UPDATE_REQUIRED]);

function isNonActionableError(error: Error, errorType: AuthenticationErrorType, jsonCode: number | string | undefined): boolean {
    if (NON_ACTIONABLE_ERROR_TYPES.has(errorType)) {
        return true;
    }
    return errorType === 'auth_failure' && !(error instanceof HttpsError) && EXPECTED_AUTH_FAILURE_JSON_CODES.has(Number(jsonCode));
}

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

    if (isNonActionableError(error, errorType, jsonCode)) {
        Sentry.logger.warn(`[Authentication] ${errorType}`, {...tags, ...extra, errorMessage: errorMessage ?? error.message});
        return;
    }

    Sentry.captureException(error, {tags, extra});
}

export default trackAuthenticationError;

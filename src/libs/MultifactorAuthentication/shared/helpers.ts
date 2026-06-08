/**
 * Shared helper utilities for multifactor authentication operations.
 */
import type {ValueOf} from 'type-fest';
import type {AuthenticationChallenge, RegistrationChallenge} from './challengeTypes';
import type {MultifactorAuthenticationReason, MultifactorAuthenticationResponseMap} from './types';
import VALUES from './VALUES';

type ResponseToReasonMap = ValueOf<MultifactorAuthenticationResponseMap>;
type HttpStatusCategory = ValueOf<typeof VALUES.HTTP_STATUS>;

const categorizeHttpStatus = (httpStatusCode: number): HttpStatusCategory | undefined => {
    if (httpStatusCode >= 200 && httpStatusCode < 300) {
        return VALUES.HTTP_STATUS.SUCCESS;
    }
    if (httpStatusCode >= 400 && httpStatusCode < 500) {
        return VALUES.HTTP_STATUS.CLIENT_ERROR;
    }
    if (httpStatusCode >= 500 && httpStatusCode < 600) {
        return VALUES.HTTP_STATUS.SERVER_ERROR;
    }
    return undefined;
};

const getFallbackReason = (category: HttpStatusCategory | undefined): MultifactorAuthenticationReason | undefined => {
    if (category === VALUES.HTTP_STATUS.CLIENT_ERROR) {
        return VALUES.REASON.CLIENT_ERRORS.UNRECOGNIZED;
    }
    if (category === VALUES.HTTP_STATUS.SERVER_ERROR) {
        return VALUES.REASON.SERVER_ERRORS.UNRECOGNIZED;
    }
    if (category === VALUES.HTTP_STATUS.SUCCESS) {
        return undefined;
    }
    return VALUES.REASON.LOCAL_ERRORS.UNHANDLED_API_RESPONSE;
};

const hasHttpStatusCategory = (responseMap: ResponseToReasonMap, category: HttpStatusCategory): category is keyof ResponseToReasonMap => category in responseMap;

/**
 * Matches a backend API error message against a map of known messages and returns the corresponding reason.
 * This is used to translate raw backend error strings into typed internal reason codes for error handling in the MFA flow.
 */
const findReasonByBackendMessage = (messageMap: Record<string, MultifactorAuthenticationReason>, message: string): MultifactorAuthenticationReason | undefined => {
    const lowerMessage = message.toLowerCase();
    // Backend prepends the HTTP status code to the message (e.g. "400 Registration required"), so we use endsWith to match the known suffix.
    const entry = Object.entries(messageMap).find(([backendMessage]) => lowerMessage.endsWith(backendMessage.toLowerCase()));
    return entry?.[1];
};

const resolveReason = (responseMap: ResponseToReasonMap, category: HttpStatusCategory | undefined, message: string | undefined): MultifactorAuthenticationReason | undefined => {
    if (!category || !hasHttpStatusCategory(responseMap, category)) {
        return undefined;
    }

    const entry = responseMap[category];

    if (typeof entry === 'string') {
        return entry;
    }

    if (!message) {
        return undefined;
    }

    return findReasonByBackendMessage(entry, message);
};

/**
 * Parses an HTTP response and resolves it to a reason using the provided response map.
 */
function parseHttpResponse(
    jsonCode: string | number | undefined,
    responseMap: ResponseToReasonMap,
    message: string | undefined,
): {
    httpStatusCode: number;
    reason: MultifactorAuthenticationReason | undefined;
    message: string | undefined;
} {
    const httpStatusCode = Number(jsonCode ?? 0);
    const category = categorizeHttpStatus(httpStatusCode);
    const reason = resolveReason(responseMap, category, message) ?? getFallbackReason(category);

    return {httpStatusCode, reason, message};
}

function isHttpSuccess(httpStatusCode: number | undefined): boolean {
    return httpStatusCode !== undefined && categorizeHttpStatus(httpStatusCode) === VALUES.HTTP_STATUS.SUCCESS;
}

function isRegistrationChallenge(challenge: unknown): challenge is RegistrationChallenge {
    return typeof challenge === 'object' && challenge !== null && 'user' in challenge && 'rp' in challenge;
}

function isAuthenticationChallenge(challenge: unknown): challenge is AuthenticationChallenge {
    return typeof challenge === 'object' && challenge !== null && 'allowCredentials' in challenge && 'rpId' in challenge;
}

export {parseHttpResponse, isHttpSuccess, isRegistrationChallenge, isAuthenticationChallenge};

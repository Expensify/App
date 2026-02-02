/**
 * Helper utilities for multifactor authentication biometrics operations.
 */
import type {Entries, ValueOf} from 'type-fest';
import type {MultifactorAuthenticationReason, MultifactorAuthenticationResponseMap} from './types';
import VALUES from './VALUES';

type ParseHTTPSource = ValueOf<MultifactorAuthenticationResponseMap>;

const httpCodeIsDefined = (source: ParseHTTPSource, httpCode: number): httpCode is keyof ParseHTTPSource => Object.keys(source).some((key) => Number(key) === httpCode);

const findMessageInSource = (source: ParseHTTPSource[keyof ParseHTTPSource], message: string | undefined): MultifactorAuthenticationReason => {
    if (!message) {
        return VALUES.REASON.BACKEND.UNKNOWN_RESPONSE;
    }

    const sourceEntries = Object.entries(source) as Entries<typeof source>;
    const [, value] = sourceEntries.find(([, predefinedMessage]) => message.endsWith(predefinedMessage)) ?? [];
    return value ?? VALUES.REASON.BACKEND.UNKNOWN_RESPONSE;
};

/**
 * Parses an HTTP response code along with a message and returns the corresponding HTTP code and reason.
 */
function parseHttpRequest(
    jsonCode: string | number | undefined,
    source: ParseHTTPSource,
    message: string | undefined,
): {
    httpCode: number;
    reason: MultifactorAuthenticationReason;
} {
    const httpCode = Number(jsonCode ?? 0);

    if (!httpCodeIsDefined(source, httpCode)) {
        return {
            httpCode,
            reason: VALUES.REASON.BACKEND.UNKNOWN_RESPONSE,
        };
    }

    if (httpCode === 200) {
        return {
            httpCode,
            reason: source[200],
        };
    }

    const codes = source[httpCode];

    return {
        httpCode,
        reason: findMessageInSource(codes, message),
    };
}

/**
 * Decodes Expo error messages and maps them to authentication error reasons.
 */
function decodeExpoMessage(error: unknown): MultifactorAuthenticationReason {
    const errorString = String(error);
    const parts = errorString.split(VALUES.EXPO_ERRORS.SEPARATOR);
    const searchString = parts.length > 1 ? parts.slice(1).join(';').trim() : errorString;

    for (const [searchKey, errorValue] of Object.entries(VALUES.EXPO_ERROR_MAPPINGS)) {
        if (searchString.includes(searchKey)) {
            return errorValue;
        }
    }

    return VALUES.REASON.EXPO.GENERIC;
}

/**
 * Decodes an Expo error message with optional fallback for generic errors.
 */
const decodeMultifactorAuthenticationExpoMessage = (message: unknown, fallback?: MultifactorAuthenticationReason): MultifactorAuthenticationReason => {
    const decodedMessage = decodeExpoMessage(message);
    return decodedMessage === VALUES.REASON.EXPO.GENERIC && fallback ? fallback : decodedMessage;
};

export {decodeMultifactorAuthenticationExpoMessage as decodeExpoMessage, parseHttpRequest};

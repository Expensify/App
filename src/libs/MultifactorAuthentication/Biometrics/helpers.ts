/**
 * Helper utilities for multifactor authentication biometrics operations.
 */
import type {Entries, ValueOf} from 'type-fest';
import type {MultifactorAuthenticationReason, MultifactorAuthenticationResponseMap} from './types';
import VALUES from './VALUES';

type ParseHTTPSource = ValueOf<MultifactorAuthenticationResponseMap>;
type HttpStatusCategory = ValueOf<typeof VALUES.HTTP_STATUS>;

const getHttpStatusCategory = (httpStatusCode: number): HttpStatusCategory | undefined => {
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

const httpStatusCategoryIsDefined = (source: ParseHTTPSource, category: HttpStatusCategory): category is keyof ParseHTTPSource => Object.keys(source).some((key) => key === category);

const findMessageInSource = (source: ParseHTTPSource[keyof ParseHTTPSource], message: string | undefined): MultifactorAuthenticationReason => {
    if (!message) {
        return VALUES.REASON.GENERIC.UNKNOWN_RESPONSE;
    }

    const sourceEntries = Object.entries(source) as Entries<typeof source>;
    const [, value] = sourceEntries.find(([backendMessage]) => message.endsWith(backendMessage)) ?? [];
    return value ?? VALUES.REASON.GENERIC.UNKNOWN_RESPONSE;
};

/**
 * Parses an HTTP response code along with a message and returns the corresponding HTTP status category and reason.
 */
function parseHttpRequest(
    jsonCode: string | number | undefined,
    source: ParseHTTPSource,
    message: string | undefined,
): {
    httpStatusCode: number;
    reason: MultifactorAuthenticationReason;
    message: string | undefined;
} {
    const httpStatusCode = Number(jsonCode ?? 0);
    const httpStatusCategory = getHttpStatusCategory(httpStatusCode);

    if (!httpStatusCategory || !httpStatusCategoryIsDefined(source, httpStatusCategory)) {
        return {
            httpStatusCode,
            reason: VALUES.REASON.GENERIC.UNKNOWN_RESPONSE,
            message,
        };
    }

    const responseMapEntry = source[httpStatusCategory];

    if (typeof responseMapEntry === 'string') {
        return {
            httpStatusCode,
            reason: responseMapEntry,
            message,
        };
    }

    return {
        httpStatusCode,
        reason: findMessageInSource(responseMapEntry, message),
        message,
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

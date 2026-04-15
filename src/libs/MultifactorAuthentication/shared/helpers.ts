/**
 * Shared helper utilities for multifactor authentication operations.
 */
import type {ValueOf} from 'type-fest';
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

const getCategoryFallbackReason = (httpStatusCategory: HttpStatusCategory): MultifactorAuthenticationReason | undefined => {
    if (httpStatusCategory === VALUES.HTTP_STATUS.CLIENT_ERROR) {
        return VALUES.REASON.CLIENT_ERRORS.UNHANDLED;
    }
    if (httpStatusCategory === VALUES.HTTP_STATUS.SERVER_ERROR) {
        return VALUES.REASON.SERVER_ERRORS.UNHANDLED;
    }
    if (httpStatusCategory === VALUES.HTTP_STATUS.SUCCESS) {
        return undefined;
    }
    return VALUES.REASON.LOCAL_ERRORS.UNHANDLED;
};

const findMessageInSource = (source: Record<string, MultifactorAuthenticationReason>, message: string): MultifactorAuthenticationReason | undefined => {
    const lowerMessage = message.toLowerCase();
    const entry = Object.entries(source).find(([backendMessage]) => lowerMessage.endsWith(backendMessage.toLowerCase()));
    return entry?.[1];
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
    reason: MultifactorAuthenticationReason | undefined;
    message: string | undefined;
} {
    const httpStatusCode = Number(jsonCode ?? 0);
    const httpStatusCategory = getHttpStatusCategory(httpStatusCode);

    if (!httpStatusCategory) {
        return {
            httpStatusCode,
            reason: VALUES.REASON.LOCAL_ERRORS.UNHANDLED,
            message,
        };
    }

    const fallback = getCategoryFallbackReason(httpStatusCategory);

    if (!httpStatusCategoryIsDefined(source, httpStatusCategory)) {
        return {
            httpStatusCode,
            reason: fallback,
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

    if (!message) {
        return {httpStatusCode, reason: fallback, message};
    }

    return {
        httpStatusCode,
        reason: findMessageInSource(responseMapEntry, message) ?? fallback,
        message,
    };
}

export default parseHttpRequest;

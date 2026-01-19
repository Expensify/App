/**
 * Helper utilities for multifactor authentication biometrics operations.
 */
import type {ValueOf} from 'type-fest';
import type {MultifactorAuthenticationReason, MultifactorAuthenticationResponseMap} from './types';
import VALUES from './VALUES';

/**
 * Parses an HTTP response code and returns the corresponding HTTP code and reason.
 */
function parseHttpCode(
    jsonCode: string | number | undefined,
    source: ValueOf<Omit<MultifactorAuthenticationResponseMap, 'UNKNOWN'>>,
): {
    httpCode: number;
    reason: MultifactorAuthenticationReason;
} {
    const httpCode = Number(jsonCode) || 0;
    const reason = source[httpCode as keyof typeof source] ?? VALUES.API_RESPONSE_MAP.UNKNOWN;

    return {
        httpCode,
        reason,
    };
}

// eslint-disable-next-line import/prefer-default-export
export {parseHttpCode};

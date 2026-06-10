import * as Sentry from '@sentry/react-native';
import CONST from '@src/CONST';

/**
 * Native-platform error fragments that indicate a TLS certificate-pinning failure rather than a
 * generic connectivity problem. These are surfaced through the rejected `fetch()` promise:
 *  - Android (Cronet / OkHttp): `ERR_SSL_PINNED_KEY_NOT_IN_CERT_CHAIN`, `CertificatePinner`
 *  - iOS (TrustKit / URLSession): `pinning`, `kSecTrustResult`, `-1202` (server cert untrusted)
 */
const PINNING_ERROR_FRAGMENTS = ['ERR_SSL_PINNED_KEY_NOT_IN_CERT_CHAIN', 'CertificatePinner', 'pinning', 'kSecTrustResult', '-1202'];

/**
 * Safely extract a string message from an unknown error value without relying on Object stringification.
 */
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return typeof error === 'string' ? error : '';
}

/**
 * Best-effort detection of a certificate-pinning failure from a rejected `fetch()` error.
 * Pinning is enforced natively, so the JS layer only sees the resulting network error message.
 */
function isCertificatePinningError(error: unknown): boolean {
    const message = getErrorMessage(error);
    if (!message) {
        return false;
    }
    return PINNING_ERROR_FRAGMENTS.some((fragment) => message.includes(fragment));
}

/**
 * Extract the host from a request URL so we can tag which pinned domain failed validation.
 */
function getHostFromURL(url: string): string {
    try {
        return new URL(url).hostname;
    } catch {
        return '';
    }
}

/**
 * Report a certificate-pinning failure to Sentry. A pin failure is security-relevant (it can mean a
 * MITM attempt, a corporate TLS proxy, or a certificate rotation the shipped app does not yet know
 * about) so it is captured distinctly from ordinary "you appear to be offline" network errors.
 */
function reportCertificatePinningError(error: unknown, url: string): void {
    const host = getHostFromURL(url);
    const exception = error instanceof Error ? error : new Error(getErrorMessage(error) || 'Certificate pinning validation failed');
    Sentry.captureException(exception, {
        tags: {
            [CONST.TELEMETRY.TAGS.CERTIFICATE_PINNING_HOST]: host || 'unknown',
        },
        extra: {url},
    });
}

export {isCertificatePinningError, reportCertificatePinningError};

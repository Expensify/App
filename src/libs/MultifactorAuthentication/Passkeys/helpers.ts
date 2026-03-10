/**
 * Helper utilities for passkey/WebAuthn error decoding.
 */
import type {MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/shared/types';
import VALUES from './VALUES';

/**
 * Decodes WebAuthn DOMException errors and maps them to authentication error reasons.
 */
function decodeWebAuthnError(error: unknown): MultifactorAuthenticationReason {
    if (error instanceof DOMException) {
        const mapping = VALUES.WEBAUTHN_ERROR_MAPPINGS[error.name as keyof typeof VALUES.WEBAUTHN_ERROR_MAPPINGS];
        if (mapping) {
            return mapping;
        }
    }

    return VALUES.REASON.WEBAUTHN.GENERIC;
}

// eslint-disable-next-line import/prefer-default-export
export {decodeWebAuthnError};

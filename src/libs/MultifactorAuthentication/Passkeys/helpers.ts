/**
 * Helper utilities for passkey/WebAuthn error decoding.
 */
import type {MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/shared/types';
import VALUES from '@libs/MultifactorAuthentication/VALUES';

function isWebAuthnErrorName(name: string): name is keyof typeof VALUES.WEBAUTHN_ERROR_MAPPINGS {
    return name in VALUES.WEBAUTHN_ERROR_MAPPINGS;
}

/**
 * Decodes WebAuthn DOMException errors and maps them to authentication error reasons.
 */
function decodeWebAuthnError(error: unknown): MultifactorAuthenticationReason {
    if (error instanceof DOMException && isWebAuthnErrorName(error.name)) {
        return VALUES.WEBAUTHN_ERROR_MAPPINGS[error.name];
    }

    return VALUES.REASON.WEBAUTHN.GENERIC;
}

export default decodeWebAuthnError;

/**
 * Helper utilities for passkey/WebAuthn error decoding.
 */
import type {MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/shared/types';
import VALUES from '@libs/MultifactorAuthentication/VALUES';

function isWebAuthnReason(name: string): name is MultifactorAuthenticationReason {
    return Object.values<string>(VALUES.REASON.WEBAUTHN).includes(name);
}

/**
 * Decodes WebAuthn DOMException errors and maps them to authentication error reasons.
 */
function decodeWebAuthnError(error: unknown): MultifactorAuthenticationReason {
    if (error instanceof DOMException && isWebAuthnReason(error.name)) {
        return error.name;
    }

    return VALUES.REASON.WEBAUTHN.GENERIC;
}

export default decodeWebAuthnError;

/**
 * Constants specific to passkey/WebAuthn authentication.
 */
import SHARED_VALUES from '@libs/MultifactorAuthentication/shared/VALUES';

const {REASON} = SHARED_VALUES;

/**
 * WebAuthn DOMException name strings for error matching.
 */
const WEBAUTHN_ERRORS = {
    SEARCH_STRING: {
        NOT_ALLOWED: 'NotAllowedError',
        INVALID_STATE: 'InvalidStateError',
        SECURITY: 'SecurityError',
        ABORT: 'AbortError',
        NOT_SUPPORTED: 'NotSupportedError',
        CONSTRAINT: 'ConstraintError',
    },
} as const;

/**
 * Maps WebAuthn DOMException names to appropriate reason messages.
 */
const WEBAUTHN_ERROR_MAPPINGS = {
    NotAllowedError: REASON.WEBAUTHN.NOT_ALLOWED,
    InvalidStateError: REASON.WEBAUTHN.INVALID_STATE,
    SecurityError: REASON.WEBAUTHN.SECURITY_ERROR,
    AbortError: REASON.WEBAUTHN.ABORT,
    NotSupportedError: REASON.WEBAUTHN.NOT_SUPPORTED,
    ConstraintError: REASON.WEBAUTHN.CONSTRAINT_ERROR,
} as const;

const PASSKEY_VALUES = {
    WEBAUTHN_ERRORS,
    WEBAUTHN_ERROR_MAPPINGS,
} as const;

export default PASSKEY_VALUES;

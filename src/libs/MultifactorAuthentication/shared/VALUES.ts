/**
 * Constants for multifactor authentication biometrics flow and API responses.
 */
import {PROMPT_NAMES, SCENARIO_NAMES} from '@components/MultifactorAuthentication/config/scenarios/names';

/**
 * Backend message strings as returned by the API.
 * Used as keys in API_RESPONSE_MAP for matching against actual backend responses.
 */
const BACKEND_MESSAGE = {
    REGISTRATION_REQUIRED: 'Registration required',
    INVALID_VALIDATE_CODE: 'Invalid validate code',
    TRANSACTION_EXPIRED: 'Transaction review period expired',
    TRANSACTION_ALREADY_APPROVED: 'Transaction already approved',
    TRANSACTION_ALREADY_DENIED: 'Transaction already denied',
    TRANSACTION_ALREADY_REVIEWED: 'Transaction already reviewed',
} as const;

const REASON = {
    SERVER_ERRORS: {
        /** Unrecognized 5xx response from the backend. */
        UNHANDLED: 'Unrecognized server error',
    },
    CLIENT_ERRORS: {
        REGISTRATION_REQUIRED: 'Registration required',
        INVALID_VALIDATE_CODE: 'Invalid validate code',
        TRANSACTION_DENIED: 'Transaction denied successfully',
        TRANSACTION_EXPIRED: 'Transaction review period has expired',
        ALREADY_APPROVED_APPROVE_ATTEMPTED: 'Already approved, approve attempted',
        ALREADY_APPROVED_DENY_ATTEMPTED: 'Already approved, deny attempted',
        ALREADY_DENIED_DENY_ATTEMPTED: 'Already denied, deny attempted',
        ALREADY_DENIED_APPROVE_ATTEMPTED: 'Already denied, approve attempted',
        ALREADY_REVIEWED: 'Transaction already reviewed',
        BAD_REQUEST: 'Bad request',
        /** Unrecognized 4xx response from the backend with no specific handler. */
        UNHANDLED: 'Unrecognized client error',
    },
    LOCAL_ERRORS: {
        SIGNATURE_MISSING: 'Signed challenge is missing from authentication result',
        /** The device type is correct for this scenario but no authentication methods are enrolled (e.g. no fingerprint/face/passcode set up in device settings). */
        NO_AUTHENTICATION_METHODS_ENROLLED: 'No authentication methods enrolled',
        /** The scenario does not allow this device's authentication type (e.g. biometrics-only scenario on web, or passkeys-only scenario on mobile). */
        AUTHENTICATION_TYPE_NOT_SUPPORTED: 'Authentication type not supported',
        UNHANDLED_EXCEPTION: 'An unhandled error occurred',
        REQUESTED_TRANSACTION_UNAVAILABLE: 'Requested transaction is unavailable',
        CANCELED: 'Flow canceled by user',
        /** No HTTP status code present — typically a network failure, JSON parse error, or unhandled exception in an action function. */
        UNHANDLED_API_RESPONSE: 'Missing HTTP status in API response',
        WEBAUTHN: {
            NOT_ALLOWED: 'WebAuthn operation not allowed',
            INVALID_STATE: 'WebAuthn invalid state',
            SECURITY_ERROR: 'WebAuthn security error',
            ABORT: 'WebAuthn operation aborted',
            NOT_SUPPORTED: 'WebAuthn not supported',
            CONSTRAINT_ERROR: 'WebAuthn constraint error',
            REGISTRATION_REQUIRED: 'No matching passkey credentials found locally',
            UNEXPECTED_RESPONSE: 'WebAuthn credential response type is unexpected',
            GENERIC: 'An unknown WebAuthn error occurred',
        },
        HSM: {
            CANCELED: 'Biometric authentication canceled by user',
            NOT_AVAILABLE: 'Biometric authentication not available',
            LOCKOUT: 'Biometric authentication locked out',
            LOCKOUT_PERMANENT: 'Biometric authentication permanently locked out',
            KEY_NOT_FOUND: 'HSM cryptographic key not found',
            SIGNATURE_FAILED: 'HSM signature creation failed',
            KEY_CREATION_FAILED: 'HSM key creation failed',
            KEY_ACCESS_FAILED: 'Failed to access cryptographic key',
            AUTHENTICATION_FAILED: 'Biometric authentication failed',
            GENERIC: 'An HSM error occurred',
        },
    },
} as const;

const HTTP_STATUS = {
    SUCCESS: 'SUCCESS',
    CLIENT_ERROR: 'CLIENT_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
} as const;

/**
 * Maps API endpoints to HTTP status categories and corresponding reason messages.
 * Keys in error sub-maps are backend message strings (BACKEND_MESSAGE) used for matching.
 * Values are the internal REASON constants returned to the caller.
 *
 * Only errors with explicit custom handling are listed. All other 4xx/5xx responses
 * fall through to REASON.CLIENT_ERRORS.UNHANDLED or REASON.SERVER_ERRORS.UNHANDLED.
 */
const API_RESPONSE_MAP = {
    REQUEST_AUTHENTICATION_CHALLENGE: {
        [HTTP_STATUS.CLIENT_ERROR]: {
            [BACKEND_MESSAGE.REGISTRATION_REQUIRED]: REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED,
            [BACKEND_MESSAGE.INVALID_VALIDATE_CODE]: REASON.CLIENT_ERRORS.INVALID_VALIDATE_CODE,
        },
    },
    REGISTER_AUTHENTICATION_KEY: {
        [HTTP_STATUS.CLIENT_ERROR]: {
            [BACKEND_MESSAGE.INVALID_VALIDATE_CODE]: REASON.CLIENT_ERRORS.INVALID_VALIDATE_CODE,
            [BACKEND_MESSAGE.REGISTRATION_REQUIRED]: REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED,
        },
    },
    TROUBLESHOOT_MULTIFACTOR_AUTHENTICATION: {
        [HTTP_STATUS.CLIENT_ERROR]: {
            [BACKEND_MESSAGE.REGISTRATION_REQUIRED]: REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED,
        },
    },
    REVOKE_MULTIFACTOR_AUTHENTICATION_SETUP: {
        [HTTP_STATUS.CLIENT_ERROR]: {
            [BACKEND_MESSAGE.REGISTRATION_REQUIRED]: REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED,
        },
    },

    /** Transaction review (3DS) - approve/deny endpoints */
    APPROVE_TRANSACTION: {
        [HTTP_STATUS.CLIENT_ERROR]: {
            [BACKEND_MESSAGE.REGISTRATION_REQUIRED]: REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED,
            [BACKEND_MESSAGE.TRANSACTION_EXPIRED]: REASON.CLIENT_ERRORS.TRANSACTION_EXPIRED,
            [BACKEND_MESSAGE.TRANSACTION_ALREADY_APPROVED]: REASON.CLIENT_ERRORS.ALREADY_APPROVED_APPROVE_ATTEMPTED,
            [BACKEND_MESSAGE.TRANSACTION_ALREADY_DENIED]: REASON.CLIENT_ERRORS.ALREADY_DENIED_APPROVE_ATTEMPTED,
            [BACKEND_MESSAGE.TRANSACTION_ALREADY_REVIEWED]: REASON.CLIENT_ERRORS.ALREADY_REVIEWED,
        },
    },

    /**
     * DENY_TRANSACTION intentionally keeps a SUCCESS entry mapping to TRANSACTION_DENIED.
     * TRANSACTION_DENIED is an *error* reason — it represents "authorization denied by user" —
     * used in failureScreens (→ DeniedTransactionSuccessScreen) and checked directly in
     * AuthorizeTransactionPage. The HTTP 200 here is the deny API call succeeding, not the
     * MFA authorization succeeding.
     */
    DENY_TRANSACTION: {
        [HTTP_STATUS.SUCCESS]: REASON.CLIENT_ERRORS.TRANSACTION_DENIED,
        [HTTP_STATUS.CLIENT_ERROR]: {
            [BACKEND_MESSAGE.REGISTRATION_REQUIRED]: REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED,
            [BACKEND_MESSAGE.TRANSACTION_EXPIRED]: REASON.CLIENT_ERRORS.TRANSACTION_EXPIRED,
            [BACKEND_MESSAGE.TRANSACTION_ALREADY_APPROVED]: REASON.CLIENT_ERRORS.ALREADY_APPROVED_DENY_ATTEMPTED,
            [BACKEND_MESSAGE.TRANSACTION_ALREADY_DENIED]: REASON.CLIENT_ERRORS.ALREADY_DENIED_DENY_ATTEMPTED,
            [BACKEND_MESSAGE.TRANSACTION_ALREADY_REVIEWED]: REASON.CLIENT_ERRORS.ALREADY_REVIEWED,
        },
    },

    /** No custom error handling — all responses rely on category fallback reasons. */
    SET_PERSONAL_DETAILS_AND_SHIP_EXPENSIFY_CARDS_WITH_PIN: {},

    /** No custom error handling — all responses rely on category fallback reasons. */
    REVEAL_CARD_PIN: {},

    /** No custom error handling — all responses rely on category fallback reasons. */
    CHANGE_CARD_PIN: {},
} as const;

type DeepLeafValues<T> = T extends Record<string, unknown> ? DeepLeafValues<T[keyof T]> : T;
type ReasonValue = DeepLeafValues<typeof REASON>;

/** Known errors the user is likely to encounter (cancellations, expired transactions, unsupported devices, etc.). Logged at 'info' level. */
const ROUTINE_FAILURES = new Set<ReasonValue>([
    REASON.LOCAL_ERRORS.CANCELED,
    REASON.LOCAL_ERRORS.NO_AUTHENTICATION_METHODS_ENROLLED,
    REASON.LOCAL_ERRORS.AUTHENTICATION_TYPE_NOT_SUPPORTED,
    REASON.CLIENT_ERRORS.TRANSACTION_EXPIRED,
    REASON.CLIENT_ERRORS.TRANSACTION_DENIED,
    REASON.CLIENT_ERRORS.INVALID_VALIDATE_CODE,
    REASON.CLIENT_ERRORS.ALREADY_APPROVED_APPROVE_ATTEMPTED,
    REASON.CLIENT_ERRORS.ALREADY_APPROVED_DENY_ATTEMPTED,
    REASON.CLIENT_ERRORS.ALREADY_DENIED_APPROVE_ATTEMPTED,
    REASON.CLIENT_ERRORS.ALREADY_DENIED_DENY_ATTEMPTED,
    REASON.CLIENT_ERRORS.ALREADY_REVIEWED,
    REASON.LOCAL_ERRORS.WEBAUTHN.NOT_ALLOWED,
    REASON.LOCAL_ERRORS.WEBAUTHN.ABORT,
    REASON.LOCAL_ERRORS.WEBAUTHN.NOT_SUPPORTED,
    REASON.LOCAL_ERRORS.HSM.CANCELED,
    REASON.LOCAL_ERRORS.HSM.NOT_AVAILABLE,
    REASON.LOCAL_ERRORS.HSM.LOCKOUT,
    REASON.LOCAL_ERRORS.HSM.AUTHENTICATION_FAILED,
]);

/** Known errors that should rarely happen and may indicate a bug or unexpected state. Logged at 'error' level. Any reason not in either set is treated as UNCLASSIFIED (e.g. missing reason). */
const ANOMALOUS_FAILURES = new Set<ReasonValue>([
    REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED,
    REASON.CLIENT_ERRORS.BAD_REQUEST,
    REASON.CLIENT_ERRORS.UNHANDLED,
    REASON.SERVER_ERRORS.UNHANDLED,
    REASON.LOCAL_ERRORS.UNHANDLED_API_RESPONSE,
    REASON.LOCAL_ERRORS.UNHANDLED_EXCEPTION,
    REASON.LOCAL_ERRORS.SIGNATURE_MISSING,
    REASON.LOCAL_ERRORS.REQUESTED_TRANSACTION_UNAVAILABLE,
    REASON.LOCAL_ERRORS.WEBAUTHN.INVALID_STATE,
    REASON.LOCAL_ERRORS.WEBAUTHN.SECURITY_ERROR,
    REASON.LOCAL_ERRORS.WEBAUTHN.CONSTRAINT_ERROR,
    REASON.LOCAL_ERRORS.WEBAUTHN.REGISTRATION_REQUIRED,
    REASON.LOCAL_ERRORS.WEBAUTHN.UNEXPECTED_RESPONSE,
    REASON.LOCAL_ERRORS.WEBAUTHN.GENERIC,
    REASON.LOCAL_ERRORS.HSM.LOCKOUT_PERMANENT,
    REASON.LOCAL_ERRORS.HSM.SIGNATURE_FAILED,
    REASON.LOCAL_ERRORS.HSM.KEY_NOT_FOUND,
    REASON.LOCAL_ERRORS.HSM.KEY_CREATION_FAILED,
    REASON.LOCAL_ERRORS.HSM.KEY_ACCESS_FAILED,
    REASON.LOCAL_ERRORS.HSM.GENERIC,
]);

const SHARED_VALUES = {
    /**
     * Scenario name mappings.
     */
    SCENARIO: SCENARIO_NAMES,

    /**
     * Prompt name mappings.
     */
    PROMPT: PROMPT_NAMES,

    /**
     * Maps authentication type to the corresponding prompt type.
     */
    PROMPT_TYPE_MAP: {
        BIOMETRICS_HSM: PROMPT_NAMES.BIOMETRICS_HSM,
        PASSKEYS: PROMPT_NAMES.PASSKEYS,
    },

    /**
     * Authentication type identifiers used for identification of allowed authentication methods in scenarios
     */
    TYPE: {
        BIOMETRICS_HSM: 'BIOMETRICS_HSM',
        PASSKEYS: 'PASSKEYS',
    },
    CHALLENGE_TYPE: {
        REGISTRATION: 'registration',
        AUTHENTICATION: 'authentication',
    },

    /**
     * One of these parameters are always present in any MFA request.
     * Validate code in the registration and signedChallenge in the authentication.
     */
    BASE_PARAMETERS: {
        SIGNED_CHALLENGE: 'signedChallenge',
        VALIDATE_CODE: 'validateCode',
    },
    API_RESPONSE_MAP,
    BACKEND_MESSAGE,
    REASON,
    HTTP_STATUS,
    ROUTINE_FAILURES,
    ANOMALOUS_FAILURES,

    /**
     * Specifically meaningful values for `multifactorAuthenticationPublicKeyIDs` in the `account` Onyx key.
     * Casting `[] as string[]` is necessary to allow us to actually store the value in Onyx. Otherwise the
     * `as const` would mean `[]` becomes `readonly []` (readonly empty array), which is more precise,
     * but isn't allowed to be assigned to a `string[]` field.
     */
    PUBLIC_KEYS_PREVIOUSLY_BUT_NOT_CURRENTLY_REGISTERED: [] as string[],
    PUBLIC_KEYS_AUTHENTICATION_NEVER_REGISTERED: undefined,

    /**
     * Used to determine the action for a particular transaction under LOCALLY_PROCESSED_3DS_TRANSACTION_REVIEWS Onyx key.
     */
    REGISTRATION_STATUS: {
        NEVER_REGISTERED: 'never',
        NOT_REGISTERED: 'not_registered',
        REGISTERED_OTHER_DEVICE: 'other_device',
        REGISTERED_THIS_DEVICE: 'this_device',
    },

    LOCALLY_PROCESSED_TRANSACTION_ACTION: {
        APPROVE: 'Approve',
        DENY: 'Deny',
    },

    /**
     * Callback response values that determine what the MultifactorAuthenticationContext should do
     * after a scenario callback is executed.
     */
    CALLBACK_RESPONSE: {
        /** Skip the outcome screen - the callback handles navigation itself */
        SKIP_OUTCOME_SCREEN: 'SKIP_OUTCOME_SCREEN',

        /** Show the outcome screen - continue with normal flow */
        SHOW_OUTCOME_SCREEN: 'SHOW_OUTCOME_SCREEN',
    },
} as const;

export type {ReasonValue};
export default SHARED_VALUES;

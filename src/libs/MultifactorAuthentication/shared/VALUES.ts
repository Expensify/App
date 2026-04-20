/**
 * Constants for multifactor authentication biometrics flow and API responses.
 */
import type {ValueOf} from 'type-fest';
import {PROMPT_NAMES, SCENARIO_NAMES} from '@components/MultifactorAuthentication/config/scenarios/names';

/**
 * Backend message strings as returned by the API.
 * Used as keys in API_RESPONSE_MAP for matching against actual backend responses.
 */
const BACKEND_MESSAGE = {
    INVALID_CHALLENGE_TYPE: 'Invalid challenge type',
    REGISTRATION_REQUIRED: 'Registration required',
    TOO_MANY_ATTEMPTS: 'Too many attempts',
    INVALID_VALIDATE_CODE: 'Invalid validate code',
    MISSING_CHALLENGE_TYPE: 'Missing challengeType',
    INVALID_KEY: 'Invalid key',
    SIGNATURE_VERIFICATION_FAILED: 'Signature verification failed',
    NO_PENDING_REGISTRATION_CHALLENGE: 'No pending registration challenge',
    INVALID_SIGNED_CHALLENGE: 'Invalid signed challenge',
    AUTHENTICATION_REQUIRED: 'Authentication required',
    UNAUTHORIZED: 'Unauthorized',
    TRANSACTION_NOT_FOUND: 'Transaction not found',
    TRANSACTION_EXPIRED: 'Transaction review period expired',
    TRANSACTION_ALREADY_APPROVED: 'Transaction already approved',
    TRANSACTION_ALREADY_DENIED: 'Transaction already denied',
    TRANSACTION_ALREADY_REVIEWED: 'Transaction already reviewed',
} as const;

const REASON = {
    /** Internal reason identifiers for multifactor authentication responses. */
    BACKEND: {
        INVALID_CHALLENGE_TYPE: 'Invalid challenge type',
        CHALLENGE_GENERATED: 'Challenge generated successfully',
        BIOMETRICS_REGISTERED: 'Biometrics registration successful',
        AUTHORIZATION_SUCCESSFUL: 'User authorized successfully',
        REGISTRATION_REQUIRED: 'Registration required',
        TOO_MANY_ATTEMPTS: 'Too many attempts',
        MISSING_CHALLENGE_TYPE: 'Missing challengeType',
        INVALID_SIGNED_CHALLENGE: 'Invalid signed challenge',
        AUTHENTICATION_REQUIRED: 'Authentication required',
        UNAUTHORIZED: 'Unauthorized',
        INVALID_KEY: 'Invalid key',
        INVALID_VALIDATE_CODE: 'Invalid validate code',
        SIGNATURE_VERIFICATION_FAILED: 'Signature verification failed',
        NO_PENDING_REGISTRATION_CHALLENGE: 'No pending registration challenge',
        REVOKE_SUCCESSFUL: 'Revoked successfully',
        TRANSACTION_NOT_FOUND: 'Transaction not found',
        TRANSACTION_EXPIRED: 'Transaction review period has expired',
        ALREADY_APPROVED_APPROVE_ATTEMPTED: 'Already approved, approve attempted',
        ALREADY_APPROVED_DENY_ATTEMPTED: 'Already approved, deny attempted',
        ALREADY_DENIED_DENY_ATTEMPTED: 'Already denied, deny attempted',
        ALREADY_DENIED_APPROVE_ATTEMPTED: 'Already denied, approve attempted',
        ALREADY_REVIEWED: 'Transaction already reviewed',
        TRANSACTION_APPROVED: 'Transaction approved successfully',
        TRANSACTION_DENIED: 'Transaction denied successfully',
        PIN_REVEALED: 'PIN revealed successfully',
        PIN_CHANGED: 'PIN changed successfully',
        SET_PIN: 'PIN set successfully',
    },
    CHALLENGE: {
        CHALLENGE_MISSING: 'Challenge is missing',
        CHALLENGE_SIGNED: 'Challenge signed successfully',
    },
    GENERIC: {
        SIGNATURE_MISSING: 'Signature is missing',
        /** The device type is correct for this scenario but no authentication methods are enrolled (e.g. no fingerprint/face/passcode set up in device settings). */
        NO_AUTHENTICATION_METHODS_ENROLLED: 'No authentication methods enrolled',
        /** The scenario does not allow this device's authentication type (e.g. biometrics-only scenario on web, or passkeys-only scenario on mobile). */
        AUTHENTICATION_TYPE_NOT_SUPPORTED: 'Authentication type not supported',
        BAD_REQUEST: 'Bad request',
        LOCAL_REGISTRATION_COMPLETE: 'Local registration complete',
        UNHANDLED_ERROR: 'An unhandled error occurred',
        REQUESTED_TRANSACTION_UNAVAILABLE: 'Requested transaction is unavailable',
        UNKNOWN_RESPONSE: 'Unknown response',
        CANCELED: 'Flow canceled by user',
    },
    WEBAUTHN: {
        NOT_ALLOWED: 'NotAllowedError',
        INVALID_STATE: 'InvalidStateError',
        SECURITY_ERROR: 'SecurityError',
        ABORT: 'AbortError',
        NOT_SUPPORTED: 'NotSupportedError',
        CONSTRAINT_ERROR: 'ConstraintError',
        REGISTRATION_REQUIRED: 'No matching passkey credentials found locally',
        UNEXPECTED_RESPONSE: 'WebAuthn credential response type is unexpected',
        GENERIC: 'An unknown WebAuthn error occurred',
    },
    HSM: {
        CANCELED: 'Biometric authentication canceled by user',
        NOT_AVAILABLE: 'Biometric authentication not available',
        LOCKOUT: 'Biometric authentication locked out',
        LOCKOUT_PERMANENT: 'Biometric authentication permanently locked out',
        KEY_NOT_FOUND: 'Key not found',
        SIGNATURE_FAILED: 'Signature creation failed',
        KEY_CREATION_FAILED: 'Key creation failed',
        KEY_ACCESS_FAILED: 'Failed to access cryptographic key',
        AUTHENTICATION_FAILED: 'Biometric authentication failed',
        GENERIC: 'An HSM error occurred',
    },
} as const;

const HTTP_STATUS = {
    SUCCESS: 'SUCCESS',
    CLIENT_ERROR: 'CLIENT_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
} as const;

const MULTIFACTOR_AUTHENTICATION_COMMAND_BASE_CLIENT_ERRORS = {
    [BACKEND_MESSAGE.INVALID_SIGNED_CHALLENGE]: REASON.BACKEND.INVALID_SIGNED_CHALLENGE,
    [BACKEND_MESSAGE.REGISTRATION_REQUIRED]: REASON.BACKEND.REGISTRATION_REQUIRED,
    [BACKEND_MESSAGE.AUTHENTICATION_REQUIRED]: REASON.BACKEND.AUTHENTICATION_REQUIRED,
    [BACKEND_MESSAGE.UNAUTHORIZED]: REASON.BACKEND.UNAUTHORIZED,
    [BACKEND_MESSAGE.TOO_MANY_ATTEMPTS]: REASON.BACKEND.TOO_MANY_ATTEMPTS,
} as const;

/**
 * Maps API endpoints to HTTP status categories and corresponding reason messages.
 * Keys in error sub-maps are backend message strings (BACKEND_MESSAGE) used for matching.
 * Values are the internal REASON constants returned to the caller.
 */
const API_RESPONSE_MAP = {
    REQUEST_AUTHENTICATION_CHALLENGE: {
        [HTTP_STATUS.SUCCESS]: REASON.BACKEND.CHALLENGE_GENERATED,
        [HTTP_STATUS.CLIENT_ERROR]: {
            [BACKEND_MESSAGE.INVALID_CHALLENGE_TYPE]: REASON.BACKEND.INVALID_CHALLENGE_TYPE,
            [BACKEND_MESSAGE.REGISTRATION_REQUIRED]: REASON.BACKEND.REGISTRATION_REQUIRED,
            [BACKEND_MESSAGE.TOO_MANY_ATTEMPTS]: REASON.BACKEND.TOO_MANY_ATTEMPTS,
            [BACKEND_MESSAGE.INVALID_VALIDATE_CODE]: REASON.BACKEND.INVALID_VALIDATE_CODE,
            [BACKEND_MESSAGE.MISSING_CHALLENGE_TYPE]: REASON.BACKEND.MISSING_CHALLENGE_TYPE,
        },
    },
    REGISTER_AUTHENTICATION_KEY: {
        [HTTP_STATUS.SUCCESS]: REASON.BACKEND.BIOMETRICS_REGISTERED,
        [HTTP_STATUS.CLIENT_ERROR]: {
            [BACKEND_MESSAGE.INVALID_KEY]: REASON.BACKEND.INVALID_KEY,
            [BACKEND_MESSAGE.INVALID_VALIDATE_CODE]: REASON.BACKEND.INVALID_VALIDATE_CODE,
            [BACKEND_MESSAGE.SIGNATURE_VERIFICATION_FAILED]: REASON.BACKEND.SIGNATURE_VERIFICATION_FAILED,
            [BACKEND_MESSAGE.TOO_MANY_ATTEMPTS]: REASON.BACKEND.TOO_MANY_ATTEMPTS,
            [BACKEND_MESSAGE.NO_PENDING_REGISTRATION_CHALLENGE]: REASON.BACKEND.NO_PENDING_REGISTRATION_CHALLENGE,
        },
    },
    TROUBLESHOOT_MULTIFACTOR_AUTHENTICATION: {
        [HTTP_STATUS.SUCCESS]: REASON.BACKEND.AUTHORIZATION_SUCCESSFUL,
        [HTTP_STATUS.CLIENT_ERROR]: {
            ...MULTIFACTOR_AUTHENTICATION_COMMAND_BASE_CLIENT_ERRORS,
        },
    },

    REVOKE_MULTIFACTOR_AUTHENTICATION_SETUP: {
        [HTTP_STATUS.SUCCESS]: REASON.BACKEND.REVOKE_SUCCESSFUL,
        [HTTP_STATUS.CLIENT_ERROR]: {
            ...MULTIFACTOR_AUTHENTICATION_COMMAND_BASE_CLIENT_ERRORS,
        },
    },

    /** Transaction review (3DS) - approve/deny endpoints */
    APPROVE_TRANSACTION: {
        [HTTP_STATUS.SUCCESS]: REASON.BACKEND.TRANSACTION_APPROVED,
        [HTTP_STATUS.CLIENT_ERROR]: {
            ...MULTIFACTOR_AUTHENTICATION_COMMAND_BASE_CLIENT_ERRORS,
            [BACKEND_MESSAGE.TRANSACTION_EXPIRED]: REASON.BACKEND.TRANSACTION_EXPIRED,
            [BACKEND_MESSAGE.TRANSACTION_ALREADY_APPROVED]: REASON.BACKEND.ALREADY_APPROVED_APPROVE_ATTEMPTED,
            [BACKEND_MESSAGE.TRANSACTION_ALREADY_DENIED]: REASON.BACKEND.ALREADY_DENIED_APPROVE_ATTEMPTED,
            [BACKEND_MESSAGE.TRANSACTION_ALREADY_REVIEWED]: REASON.BACKEND.ALREADY_REVIEWED,
            [BACKEND_MESSAGE.TRANSACTION_NOT_FOUND]: REASON.BACKEND.TRANSACTION_NOT_FOUND,
        },
    },

    DENY_TRANSACTION: {
        [HTTP_STATUS.SUCCESS]: REASON.BACKEND.TRANSACTION_DENIED,
        [HTTP_STATUS.CLIENT_ERROR]: {
            ...MULTIFACTOR_AUTHENTICATION_COMMAND_BASE_CLIENT_ERRORS,
            [BACKEND_MESSAGE.TRANSACTION_EXPIRED]: REASON.BACKEND.TRANSACTION_EXPIRED,
            [BACKEND_MESSAGE.TRANSACTION_ALREADY_APPROVED]: REASON.BACKEND.ALREADY_APPROVED_DENY_ATTEMPTED,
            [BACKEND_MESSAGE.TRANSACTION_ALREADY_DENIED]: REASON.BACKEND.ALREADY_DENIED_DENY_ATTEMPTED,
            [BACKEND_MESSAGE.TRANSACTION_ALREADY_REVIEWED]: REASON.BACKEND.ALREADY_REVIEWED,
            [BACKEND_MESSAGE.TRANSACTION_NOT_FOUND]: REASON.BACKEND.TRANSACTION_NOT_FOUND,
        },
    },

    SET_PERSONAL_DETAILS_AND_SHIP_EXPENSIFY_CARDS_WITH_PIN: {
        [HTTP_STATUS.SUCCESS]: REASON.BACKEND.SET_PIN,
    },

    REVEAL_CARD_PIN: {
        [HTTP_STATUS.SUCCESS]: REASON.BACKEND.PIN_REVEALED,
    },

    CHANGE_CARD_PIN: {
        [HTTP_STATUS.SUCCESS]: REASON.BACKEND.PIN_CHANGED,
    },
} as const;

type ReasonValue = ValueOf<{
    [K in keyof typeof REASON]: ValueOf<(typeof REASON)[K]>;
}>;

/** Known errors the user is likely to encounter (cancellations, expired transactions, unsupported devices, etc.). Logged at 'info' level. */
const ROUTINE_FAILURES = new Set<ReasonValue>([
    REASON.GENERIC.CANCELED,
    REASON.GENERIC.NO_AUTHENTICATION_METHODS_ENROLLED,
    REASON.GENERIC.AUTHENTICATION_TYPE_NOT_SUPPORTED,
    REASON.BACKEND.TRANSACTION_EXPIRED,
    REASON.BACKEND.TRANSACTION_DENIED,
    REASON.BACKEND.TOO_MANY_ATTEMPTS,
    REASON.BACKEND.INVALID_VALIDATE_CODE,
    REASON.BACKEND.ALREADY_APPROVED_APPROVE_ATTEMPTED,
    REASON.BACKEND.ALREADY_APPROVED_DENY_ATTEMPTED,
    REASON.BACKEND.ALREADY_DENIED_APPROVE_ATTEMPTED,
    REASON.BACKEND.ALREADY_DENIED_DENY_ATTEMPTED,
    REASON.BACKEND.ALREADY_REVIEWED,
    REASON.WEBAUTHN.NOT_ALLOWED,
    REASON.WEBAUTHN.ABORT,
    REASON.WEBAUTHN.NOT_SUPPORTED,
    REASON.HSM.CANCELED,
    REASON.HSM.NOT_AVAILABLE,
    REASON.HSM.LOCKOUT,
    REASON.HSM.AUTHENTICATION_FAILED,
]);

/** Known errors that should rarely happen and may indicate a bug or unexpected state. Logged at 'error' level. Any reason not in either set is treated as UNCLASSIFIED (e.g. 5xx, missing reason). */
const ANOMALOUS_FAILURES = new Set<ReasonValue>([
    REASON.BACKEND.REGISTRATION_REQUIRED,
    REASON.BACKEND.INVALID_CHALLENGE_TYPE,
    REASON.BACKEND.INVALID_SIGNED_CHALLENGE,
    REASON.BACKEND.SIGNATURE_VERIFICATION_FAILED,
    REASON.BACKEND.NO_PENDING_REGISTRATION_CHALLENGE,
    REASON.BACKEND.TRANSACTION_NOT_FOUND,
    REASON.BACKEND.INVALID_KEY,
    REASON.BACKEND.AUTHENTICATION_REQUIRED,
    REASON.BACKEND.UNAUTHORIZED,
    REASON.GENERIC.BAD_REQUEST,
    REASON.GENERIC.UNKNOWN_RESPONSE,
    REASON.WEBAUTHN.INVALID_STATE,
    REASON.WEBAUTHN.SECURITY_ERROR,
    REASON.WEBAUTHN.CONSTRAINT_ERROR,
    REASON.WEBAUTHN.REGISTRATION_REQUIRED,
    REASON.WEBAUTHN.UNEXPECTED_RESPONSE,
    REASON.WEBAUTHN.GENERIC,
    REASON.HSM.LOCKOUT_PERMANENT,
    REASON.HSM.SIGNATURE_FAILED,
    REASON.HSM.KEY_NOT_FOUND,
    REASON.HSM.KEY_CREATION_FAILED,
    REASON.HSM.KEY_ACCESS_FAILED,
    REASON.HSM.GENERIC,
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

export default SHARED_VALUES;

/**
 * Constants for multifactor authentication biometrics flow and API responses.
 */
import {PROMPT_NAMES, SCENARIO_NAMES} from '@components/MultifactorAuthentication/config/scenarios/names';

/**
 * Callback registry for multifactor authentication flow events.
 */
const MultifactorAuthenticationCallbacks: {
    onFulfill: Record<string, () => void>;
} = {
    onFulfill: {},
};

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
    },
    CHALLENGE: {
        CHALLENGE_MISSING: 'Challenge is missing',
        CHALLENGE_SIGNED: 'Challenge signed successfully',
    },
    EXPO: {
        CANCELED: 'Authentication canceled by user',
        IN_PROGRESS: 'Authentication already in progress',
        NOT_IN_FOREGROUND: 'Application must be in the foreground',
        KEY_EXISTS: 'This key already exists',
        NO_METHOD_AVAILABLE: 'No authentication methods available',
        NOT_SUPPORTED: 'This feature is not supported on the device',
        GENERIC: 'An error occurred',
    },
    GENERIC: {
        SIGNATURE_MISSING: 'Signature is missing',
        /** The device supports biometrics but the user has none enrolled (e.g. no fingerprint/face set up in device settings). */
        NO_ELIGIBLE_METHODS: 'No eligible methods available',
        /** The device hardware does not support biometrics at all (e.g. web/mWeb). */
        UNSUPPORTED_DEVICE: 'Unsupported device',
        BAD_REQUEST: 'Bad request',
        LOCAL_REGISTRATION_COMPLETE: 'Local registration complete',
        UNHANDLED_ERROR: 'An unhandled error occurred',
        REQUESTED_TRANSACTION_UNAVAILABLE: 'Requested transaction is unavailable',
        UNKNOWN_RESPONSE: 'Unknown response',
        CANCELED: 'Flow canceled by user',
    },
    KEYSTORE: {
        KEY_DELETED: 'Key successfully deleted from SecureStore',
        REGISTRATION_REQUIRED: 'Key is stored locally but not found on server',
        KEY_MISSING: 'Key is missing',
        KEY_SAVED: 'Key successfully saved in SecureStore',
        UNABLE_TO_SAVE_KEY: 'Failed to save key in SecureStore',
        UNABLE_TO_DELETE_KEY: 'Failed to delete key from SecureStore',
        KEY_RETRIEVED: 'Key successfully retrieved from SecureStore',
        KEY_NOT_FOUND: 'Key not found in SecureStore',
        UNABLE_TO_RETRIEVE_KEY: 'Failed to retrieve key from SecureStore',
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
} as const;

/**
 * Expo error message search strings and separator.
 */
const EXPO_ERRORS = {
    SEPARATOR: 'Caused by:',
    SEARCH_STRING: {
        NOT_IN_FOREGROUND: 'not in the foreground',
        IN_PROGRESS: 'in progress',
        CANCELED: 'canceled',
        EXISTS: 'already exists',
        NO_AUTHENTICATION: 'No authentication method available',
        OLD_ANDROID: 'NoSuchMethodError',
    },
} as const;

/**
 * Centralized constants used by the multifactor authentication biometrics flow.
 * It is stored here instead of the CONST file to avoid circular dependencies.
 */
const MULTIFACTOR_AUTHENTICATION_VALUES = {
    /**
     * Keychain service name for secure key storage.
     */
    KEYCHAIN_SERVICE: 'Expensify',

    /**
     * EdDSA key type identifier referred to as EdDSA in the Auth.
     */
    ED25519_TYPE: 'biometric',

    /**
     * Key alias identifiers for secure storage.
     */
    KEY_ALIASES: {
        PUBLIC_KEY: '3DS_SCA_KEY_PUBLIC',
        PRIVATE_KEY: '3DS_SCA_KEY_PRIVATE',
    },
    EXPO_ERRORS,

    /**
     * Maps authentication Expo errors to appropriate reason messages.
     */
    EXPO_ERROR_MAPPINGS: {
        [EXPO_ERRORS.SEARCH_STRING.CANCELED]: REASON.EXPO.CANCELED,
        [EXPO_ERRORS.SEARCH_STRING.IN_PROGRESS]: REASON.EXPO.IN_PROGRESS,
        [EXPO_ERRORS.SEARCH_STRING.NOT_IN_FOREGROUND]: REASON.EXPO.NOT_IN_FOREGROUND,
        [EXPO_ERRORS.SEARCH_STRING.EXISTS]: REASON.EXPO.KEY_EXISTS,
        [EXPO_ERRORS.SEARCH_STRING.NO_AUTHENTICATION]: REASON.EXPO.NO_METHOD_AVAILABLE,
        [EXPO_ERRORS.SEARCH_STRING.OLD_ANDROID]: REASON.EXPO.NOT_SUPPORTED,
    },

    /**
     * Scenario name mappings.
     */
    SCENARIO: SCENARIO_NAMES,

    /**
     * Prompt name mappings.
     */
    PROMPT: PROMPT_NAMES,

    /**
     * Authentication type identifiers.
     */
    TYPE: {
        BIOMETRICS: 'BIOMETRICS',
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

export {MultifactorAuthenticationCallbacks};
export default MULTIFACTOR_AUTHENTICATION_VALUES;

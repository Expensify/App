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

const REASON = {
    /** Backend reason messages for multifactor authentication responses. */
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
        UNKNOWN_RESPONSE: 'Unknown response',
        REVOKE_SUCCESSFUL: 'Revoked successfully',
    },
    CHALLENGE: {
        COULD_NOT_RETRIEVE_A_CHALLENGE: 'Could not retrieve a challenge',
        CHALLENGE_MISSING: 'Challenge is missing',
        CHALLENGE_ALREADY_SIGNED: 'Challenge is already signed',
        CHALLENGE_RECEIVED: 'Challenge received successfully',
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
        SIGNATURE_INVALID: 'Signature is invalid',
        SIGNATURE_MISSING: 'Signature is missing',
        NO_ACTION_MADE_YET: 'No action has been made yet',
        BIOMETRICS_NOT_ALLOWED: 'The biometrics actions are not allowed for this scenario',
        FACTORS_ERROR: 'Authentication factors error',
        FACTORS_VERIFIED: 'Authentication factors verified',
        VALIDATE_CODE_MISSING: 'Validate code is missing',
        NO_ELIGIBLE_METHODS: 'No eligible methods available',
        BAD_REQUEST: 'Bad request',
    },
    KEYSTORE: {
        KEY_PAIR_GENERATED: 'Key pair generated successfully',
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

/** List of reasons that are continuable (don't stop the MFA flow, displayed on current screen) */
const CONTINUABLE_REASONS = [REASON.BACKEND.INVALID_VALIDATE_CODE] as const;

// Disables ESLint rule because it throws an error when a key is a number like 401.
/* eslint-disable @typescript-eslint/naming-convention */
const MULTIFACTOR_AUTHENTICATION_COMMAND_BASE_RESPONSE_MAP = {
    401: {
        INVALID_SIGNED_CHALLENGE: REASON.BACKEND.INVALID_SIGNED_CHALLENGE,
        REGISTRATION_REQUIRED: REASON.BACKEND.REGISTRATION_REQUIRED,
        AUTHENTICATION_REQUIRED: REASON.BACKEND.AUTHENTICATION_REQUIRED,
        UNAUTHORIZED: REASON.BACKEND.UNAUTHORIZED,
    },
} as const;

/**
 * Maps API endpoints to their HTTP status codes and corresponding reason messages.
 */
const API_RESPONSE_MAP = {
    REQUEST_AUTHENTICATION_CHALLENGE: {
        200: REASON.BACKEND.CHALLENGE_GENERATED,
        400: {
            INVALID_CHALLENGE_TYPE: REASON.BACKEND.INVALID_CHALLENGE_TYPE,
            REGISTRATION_REQUIRED: REASON.BACKEND.REGISTRATION_REQUIRED,
        },
        401: {
            TOO_MANY_ATTEMPTS: REASON.BACKEND.TOO_MANY_ATTEMPTS,
            INVALID_VALIDATE_CODE: REASON.BACKEND.INVALID_VALIDATE_CODE,
        },
        402: {
            MISSING_CHALLENGE_TYPE: REASON.BACKEND.MISSING_CHALLENGE_TYPE,
        },
    },
    REGISTER_AUTHENTICATION_KEY: {
        200: REASON.BACKEND.BIOMETRICS_REGISTERED,
        400: {
            INVALID_KEY: REASON.BACKEND.INVALID_KEY,
        },
        401: {
            INVALID_VALIDATE_CODE: REASON.BACKEND.INVALID_VALIDATE_CODE,
            SIGNATURE_VERIFICATION_FAILED: REASON.BACKEND.SIGNATURE_VERIFICATION_FAILED,
            TOO_MANY_ATTEMPTS: REASON.BACKEND.TOO_MANY_ATTEMPTS,
            NO_PENDING_REGISTRATION_CHALLENGE: REASON.BACKEND.NO_PENDING_REGISTRATION_CHALLENGE,
        },
    },
    TROUBLESHOOT_MULTIFACTOR_AUTHENTICATION: {
        ...MULTIFACTOR_AUTHENTICATION_COMMAND_BASE_RESPONSE_MAP,
        200: REASON.BACKEND.AUTHORIZATION_SUCCESSFUL,
    },

    REVOKE_MULTIFACTOR_AUTHENTICATION_SETUP: {
        ...MULTIFACTOR_AUTHENTICATION_COMMAND_BASE_RESPONSE_MAP,
        200: REASON.BACKEND.REVOKE_SUCCESSFUL,
    },
} as const;
/* eslint-enable @typescript-eslint/naming-convention */

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
    SCENARIO_TYPE: {
        NONE: 'None',
        AUTHORIZATION: 'Authorization',
        AUTHENTICATION: 'Authentication',
    },
    TRIGGER: {
        CANCEL: 'CANCEL',
        FULFILL: 'FULFILL',
        FAILURE: 'FAILURE',
    },
    EXPO_ERRORS,

    /**
     * Maps authentication factors and Expo errors to appropriate reason messages.
     */
    EXPO_ERROR_MAPPINGS: {
        [EXPO_ERRORS.SEARCH_STRING.CANCELED]: REASON.EXPO.CANCELED,
        [EXPO_ERRORS.SEARCH_STRING.IN_PROGRESS]: REASON.EXPO.IN_PROGRESS,
        [EXPO_ERRORS.SEARCH_STRING.NOT_IN_FOREGROUND]: REASON.EXPO.NOT_IN_FOREGROUND,
        [EXPO_ERRORS.SEARCH_STRING.EXISTS]: REASON.EXPO.KEY_EXISTS,
        [EXPO_ERRORS.SEARCH_STRING.NO_AUTHENTICATION]: REASON.EXPO.NO_METHOD_AVAILABLE,
        [EXPO_ERRORS.SEARCH_STRING.OLD_ANDROID]: REASON.EXPO.NOT_SUPPORTED,
    },
    NO_SCENARIO_FOR_STATUS_REASON: {
        REGISTER: 'REGISTER',
        CANCEL: 'CANCEL',
        UPDATE: 'UPDATE',
        FULFILL: 'FULFILL',
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
     * Named factors for backwards compatibility and constituency.
     * These are the essential params for MultifactorAuthentication API calls.
     */
    FACTORS: {
        SIGNED_CHALLENGE: 'signedChallenge',
        VALIDATE_CODE: 'validateCode',
    },
    API_RESPONSE_MAP,
    CONTINUABLE_REASONS,
    REASON,
} as const;

export {MultifactorAuthenticationCallbacks};
export default MULTIFACTOR_AUTHENTICATION_VALUES;

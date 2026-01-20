/**
 * Constants for multifactor authentication biometrics flow and API responses.
 */
import SCENARIO from '@components/MultifactorAuthentication/config/scenarios/names';

/**
 * Callback registry for multifactor authentication flow events.
 */
const MultifactorAuthenticationCallbacks: {
    onFulfill: Record<string, () => void>;
} = {
    onFulfill: {},
};

/**
 * Backend reason messages for multifactor authentication responses.
 */
const REASON = {
    BACKEND: {
        REGISTRATION_REQUIRED: 'Registration is required',
        CHALLENGE_GENERATED: 'Challenge generated successfully',
        KEY_INFO_MISSING: 'Key info not provided',
        KEY_ALREADY_REGISTERED: 'This public key is already registered',
        VALIDATE_CODE_MISSING: 'Validate code is missing',
        VALIDATE_CODE_INVALID: 'Validate code is invalid',
        BIOMETRICS_REGISTERED: 'Biometrics registration successful',
        UNABLE_TO_AUTHORIZE: 'Authorization failed with provided credentials',
        AUTHORIZATION_SUCCESSFUL: 'User authorized successfully',
        BAD_REQUEST: 'Bad request',
        UNKNOWN_RESPONSE: 'Unrecognized response type',
    },
    CHALLENGE: {
        BAD_TOKEN: 'Bad token',
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
        FACTORS_ERROR: 'Authentication factors error',
        FACTORS_VERIFIED: 'Authentication factors verified',
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

/**
 * Maps API endpoints to their HTTP status codes and corresponding reason messages.
 */
/* eslint-disable @typescript-eslint/naming-convention */
const API_RESPONSE_MAP = {
    UNKNOWN: REASON.BACKEND.UNKNOWN_RESPONSE,
    REQUEST_AUTHENTICATION_CHALLENGE: {
        401: REASON.BACKEND.REGISTRATION_REQUIRED,
        200: REASON.BACKEND.CHALLENGE_GENERATED,
    },
    REGISTER_AUTHENTICATION_KEY: {
        422: REASON.BACKEND.KEY_INFO_MISSING,
        409: REASON.BACKEND.KEY_ALREADY_REGISTERED,
        401: REASON.BACKEND.VALIDATE_CODE_MISSING,
        400: REASON.BACKEND.VALIDATE_CODE_INVALID,
        200: REASON.BACKEND.BIOMETRICS_REGISTERED,
    },
    TROUBLESHOOT_MULTIFACTOR_AUTHENTICATION: {
        401: REASON.BACKEND.REGISTRATION_REQUIRED,
        409: REASON.BACKEND.UNABLE_TO_AUTHORIZE,
        200: REASON.BACKEND.AUTHORIZATION_SUCCESSFUL,
        400: REASON.BACKEND.BAD_REQUEST,
    },
} as const;
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * Factor origin types for multifactor authentication.
 */
const MULTIFACTOR_AUTHENTICATION_FACTOR_ORIGIN = {
    BIOMETRICS: 'Biometrics',
    ADDITIONAL: 'Additional',
} as const;

/**
 * Available multifactor authentication factors.
 */
const MULTIFACTOR_AUTHENTICATION_FACTORS = {
    SIGNED_CHALLENGE: 'SIGNED_CHALLENGE',
    VALIDATE_CODE: 'VALIDATE_CODE',
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
 * Maps authentication factors and Expo errors to appropriate reason messages.
 */
const MULTIFACTOR_AUTHENTICATION_ERROR_MAPPINGS = {
    /** Maps authentication factors to their missing error translation paths */
    FACTOR_MISSING_REASONS: {
        [MULTIFACTOR_AUTHENTICATION_FACTORS.VALIDATE_CODE]: REASON.BACKEND.VALIDATE_CODE_MISSING,
        [MULTIFACTOR_AUTHENTICATION_FACTORS.SIGNED_CHALLENGE]: REASON.GENERIC.SIGNATURE_MISSING,
    },

    /** Maps authentication factors to their invalid error translation paths */
    FACTOR_INVALID_REASONS: {
        [MULTIFACTOR_AUTHENTICATION_FACTORS.VALIDATE_CODE]: REASON.BACKEND.VALIDATE_CODE_INVALID,
        [MULTIFACTOR_AUTHENTICATION_FACTORS.SIGNED_CHALLENGE]: REASON.GENERIC.SIGNATURE_INVALID,
    },
    EXPO_ERROR_MAPPINGS: {
        [EXPO_ERRORS.SEARCH_STRING.CANCELED]: REASON.EXPO.CANCELED,
        [EXPO_ERRORS.SEARCH_STRING.IN_PROGRESS]: REASON.EXPO.IN_PROGRESS,
        [EXPO_ERRORS.SEARCH_STRING.NOT_IN_FOREGROUND]: REASON.EXPO.NOT_IN_FOREGROUND,
        [EXPO_ERRORS.SEARCH_STRING.EXISTS]: REASON.EXPO.KEY_EXISTS,
        [EXPO_ERRORS.SEARCH_STRING.NO_AUTHENTICATION]: REASON.EXPO.NO_METHOD_AVAILABLE,
        [EXPO_ERRORS.SEARCH_STRING.OLD_ANDROID]: REASON.EXPO.NOT_SUPPORTED,
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
     * EdDSA key type identifier referred to as EdDSA in the Auth system.
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
     * Defines the requirements and configuration for each authentication factor.
     */
    FACTORS_REQUIREMENTS: {
        SIGNED_CHALLENGE: {
            id: MULTIFACTOR_AUTHENTICATION_FACTORS.SIGNED_CHALLENGE,
            name: 'Signed Challenge',
            parameter: 'signedChallenge',
            length: undefined,
            origin: MULTIFACTOR_AUTHENTICATION_FACTOR_ORIGIN.BIOMETRICS,
        },
        VALIDATE_CODE: {
            id: MULTIFACTOR_AUTHENTICATION_FACTORS.VALIDATE_CODE,
            name: 'Email One-Time Password',
            parameter: 'validateCode',
            length: 6,
            origin: MULTIFACTOR_AUTHENTICATION_FACTOR_ORIGIN.ADDITIONAL,
        },
    },

    /**
     * Valid authentication factor combinations for different scenarios.
     */
    FACTOR_COMBINATIONS: {
        REGISTRATION: [MULTIFACTOR_AUTHENTICATION_FACTORS.VALIDATE_CODE],
        BIOMETRICS_AUTHENTICATION: [MULTIFACTOR_AUTHENTICATION_FACTORS.SIGNED_CHALLENGE],
    },

    /**
     * Factor origin classifications.
     */
    FACTORS_ORIGIN: MULTIFACTOR_AUTHENTICATION_FACTOR_ORIGIN,

    /**
     * Scenario name mappings.
     */
    SCENARIO,

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
    FACTORS: MULTIFACTOR_AUTHENTICATION_FACTORS,
    API_RESPONSE_MAP,
    REASON,
} as const;

export {MultifactorAuthenticationCallbacks, MULTIFACTOR_AUTHENTICATION_ERROR_MAPPINGS};
export default MULTIFACTOR_AUTHENTICATION_VALUES;

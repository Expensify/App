import SCENARIO from '@components/MultifactorAuthentication/config/scenarios/names';

const MultifactorAuthenticationCallbacks: {
    onFulfill: Record<string, () => void>;
} = {
    onFulfill: {},
};

const REASON = {
    BACKEND: {
        NO_PUBLIC_KEYS_REGISTERED: 'No public keys are currently registered',
        ACCESS_REVOKED: 'Successfully revoked access on all devices',
        REGISTRATION_REQUIRED: 'Registration is required',
        CHALLENGE_GENERATED: 'Challenge generated successfully',
        KEY_INFO_MISSING: 'Key info not provided',
        KEY_ALREADY_REGISTERED: 'This public key is already registered',
        VALIDATE_CODE_MISSING: 'Validate code is missing',
        VALIDATE_CODE_INVALID: 'Validate code is invalid',
        BIOMETRICS_REGISTERED: 'Biometrics registration successful',
        TRANSACTION_ID_MISSING: 'Transaction ID is missing',
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
        BIOMETRICS_NOT_ALLOWED: 'The biometrics actions are not allowed for this scenario',
        FACTORS_ERROR: 'Authentication factors error',
        FACTORS_VERIFIED: 'Authentication factors verified',
    },
    KEYSTORE: {
        KEY_PAIR_GENERATED: 'Key pair generated successfully',
        KEY_DELETED: 'Key successfully deleted from SecureStore',
        KEY_MISSING_ON_THE_BACKEND: 'Key is stored locally but not found on server',
        KEY_MISSING: 'Key is missing',
        KEY_SAVED: 'Key successfully saved in SecureStore',
        UNABLE_TO_SAVE_KEY: 'Failed to save key in SecureStore',
        UNABLE_TO_DELETE_KEY: 'Failed to delete key from SecureStore',
        KEY_RETRIEVED: 'Key successfully retrieved from SecureStore',
        KEY_NOT_FOUND: 'Key not found in SecureStore',
        UNABLE_TO_RETRIEVE_KEY: 'Failed to retrieve key from SecureStore',
    },
} as const;

/** HTTP codes returned by the API, mapped to the multifactorial authentication translation paths */
/* eslint-disable @typescript-eslint/naming-convention */
const API_RESPONSE_MAP = {
    UNKNOWN: REASON.BACKEND.UNKNOWN_RESPONSE,
    REVOKE_MULTIFACTOR_AUTHENTICATION_KEYS: {
        400: REASON.BACKEND.NO_PUBLIC_KEYS_REGISTERED,
        200: REASON.BACKEND.ACCESS_REVOKED,
    },
    REQUEST_BIOMETRIC_CHALLENGE: {
        401: REASON.BACKEND.REGISTRATION_REQUIRED,
        200: REASON.BACKEND.CHALLENGE_GENERATED,
    },
    REGISTER_BIOMETRICS: {
        422: REASON.BACKEND.KEY_INFO_MISSING,
        409: REASON.BACKEND.KEY_ALREADY_REGISTERED,
        401: REASON.BACKEND.VALIDATE_CODE_MISSING,
        400: REASON.BACKEND.VALIDATE_CODE_INVALID,
        200: REASON.BACKEND.BIOMETRICS_REGISTERED,
    },
    AUTHORIZE_TRANSACTION: {
        422: REASON.BACKEND.TRANSACTION_ID_MISSING,
        401: REASON.BACKEND.REGISTRATION_REQUIRED,
        409: REASON.BACKEND.UNABLE_TO_AUTHORIZE,
        200: REASON.BACKEND.AUTHORIZATION_SUCCESSFUL,
        400: REASON.BACKEND.BAD_REQUEST,
    },
    BIOMETRICS_TEST: {
        401: REASON.BACKEND.REGISTRATION_REQUIRED,
        409: REASON.BACKEND.UNABLE_TO_AUTHORIZE,
        200: REASON.BACKEND.AUTHORIZATION_SUCCESSFUL,
        400: REASON.BACKEND.BAD_REQUEST,
    },
} as const;
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * Defines the origin of the authentication factor, either from biometrics authentication or additional authentication.
 */
const MULTIFACTOR_AUTHENTICATION_FACTOR_ORIGIN = {
    BIOMETRICS: 'Biometrics',
    ADDITIONAL: 'Additional',
} as const;

/** All possible authentication factors that can be used in the multifactorial authentication process */
const MULTIFACTOR_AUTHENTICATION_FACTORS = {
    SIGNED_CHALLENGE: 'SIGNED_CHALLENGE',
    VALIDATE_CODE: 'VALIDATE_CODE',
} as const;

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

const MULTIFACTOR_AUTHENTICATION_VALUES = {
    /** Name of the service associated with the keys in SecureStore */
    KEYCHAIN_SERVICE: 'Expensify',
    /** Type sent to the API to indicate that ED25519 was used */
    ED25519_TYPE: 'biometric',
    /** RPID (Relying Party ID) sent to the API */
    RPID: 'expensify.com',
    /** Names that the keys are stored under in the SecureStore.  */
    KEY_ALIASES: {
        PUBLIC_KEY: '3DS_SCA_KEY_PUBLIC',
        PRIVATE_KEY: '3DS_SCA_KEY_PRIVATE',
    },
    NEED_SECOND_FACTOR_HTTP_CODE: 202,
    /** What does scenario's status refer to? Which part of multifactorial authentication is impacted by it? */
    SCENARIO_TYPE: {
        NONE: 'None',
        AUTHORIZATION: 'Authorization',
        AUTHENTICATION: 'Authentication',
    },
    TRIGGER: {
        REVOKE: 'REVOKE',
        CANCEL: 'CANCEL',
        FULFILL: 'FULFILL',
        FAILURE: 'FAILURE',
    },
    NO_SCENARIO_FOR_STATUS_REASON: {
        REGISTER: 'REGISTER',
        REVOKE: 'REVOKE',
        CANCEL: 'CANCEL',
        UPDATE: 'UPDATE',
        FULFILL: 'FULFILL',
    },
    /**
     * Used to obtain the reason for the error from its message,
     * enabling it to be mapped into our text for translation.
     */
    EXPO_ERRORS,
    /**
     * Defines the requirements for each authentication factor used in the multifactorial authentication process.
     * Each factor has:
     * - An identifier used internally
     * - A user-friendly display name
     * - The parameter name expected by the API
     * - The data type (string or number)
     * - Length requirements if applicable
     * - Whether it originates from biometrics authentication or additional authentication
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
    FACTOR_COMBINATIONS: {
        REGISTRATION: [MULTIFACTOR_AUTHENTICATION_FACTORS.VALIDATE_CODE],
        BIOMETRICS_AUTHENTICATION: [MULTIFACTOR_AUTHENTICATION_FACTORS.SIGNED_CHALLENGE],
    },
    RAN_OUT_OF_TIME_NOTIFICATION: 'YOU_RAN_OUT_OF_TIME',
    FACTORS_ORIGIN: MULTIFACTOR_AUTHENTICATION_FACTOR_ORIGIN,
    SCENARIO,
    TYPE: {
        BIOMETRICS_OR_PASSKEYS: 'BIOMETRICS_OR_PASSKEYS',
        BIOMETRICS: 'BIOMETRICS',
        PASSKEYS: 'PASSKEYS',
    },
    FACTORS: MULTIFACTOR_AUTHENTICATION_FACTORS,
    API_RESPONSE_MAP,
    REASON,
} as const;

export {MultifactorAuthenticationCallbacks, MULTIFACTOR_AUTHENTICATION_ERROR_MAPPINGS};
export default MULTIFACTOR_AUTHENTICATION_VALUES;

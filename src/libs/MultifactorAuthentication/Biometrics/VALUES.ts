import SCENARIO from '@components/MultifactorAuthentication/config/scenarios';

const MultifactorAuthenticationCallbacks: {
    onFulfill: Record<string, () => void>;
} = {
    onFulfill: {},
};

/** HTTP codes returned by the API, mapped to the multifactorial authentication translation paths */
/* eslint-disable @typescript-eslint/naming-convention */
const RESPONSE_TRANSLATION_PATH = {
    UNKNOWN: 'unknownResponse',
    REVOKE_MULTIFACTOR_AUTHENTICATION_KEYS: {
        400: 'noPublicKeysRegistered',
        200: 'revokedAccess',
    },
    REQUEST_BIOMETRIC_CHALLENGE: {
        401: 'registrationRequired',
        200: 'challengeGenerated',
    },
    REGISTER_BIOMETRICS: {
        422: 'noPublicKey',
        409: 'keyAlreadyRegistered',
        401: 'validationCodeRequired',
        400: 'validationCodeInvalid',
        200: 'multifactorAuthenticationSuccess',
    },
    AUTHORIZE_TRANSACTION: {
        422: 'noTransactionID',
        401: 'userNotRegistered',
        409: 'unableToAuthorize',
        200: 'userAuthorized',
        400: 'badRequest',
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
        [MULTIFACTOR_AUTHENTICATION_FACTORS.VALIDATE_CODE]: 'multifactorAuthentication.reason.error.validateCodeMissing',
        [MULTIFACTOR_AUTHENTICATION_FACTORS.SIGNED_CHALLENGE]: 'multifactorAuthentication.reason.error.signatureMissing',
    },
    /** Maps authentication factors to their invalid error translation paths */
    FACTOR_INVALID_REASONS: {
        [MULTIFACTOR_AUTHENTICATION_FACTORS.VALIDATE_CODE]: 'multifactorAuthentication.apiResponse.validationCodeInvalid',
        [MULTIFACTOR_AUTHENTICATION_FACTORS.SIGNED_CHALLENGE]: 'multifactorAuthentication.apiResponse.signatureInvalid',
    },
    EXPO_ERROR_MAPPINGS: {
        [EXPO_ERRORS.SEARCH_STRING.CANCELED]: 'multifactorAuthentication.reason.expoErrors.canceled',
        [EXPO_ERRORS.SEARCH_STRING.IN_PROGRESS]: 'multifactorAuthentication.reason.expoErrors.alreadyInProgress',
        [EXPO_ERRORS.SEARCH_STRING.NOT_IN_FOREGROUND]: 'multifactorAuthentication.reason.expoErrors.notInForeground',
        [EXPO_ERRORS.SEARCH_STRING.EXISTS]: 'multifactorAuthentication.reason.expoErrors.keyExists',
        [EXPO_ERRORS.SEARCH_STRING.NO_AUTHENTICATION]: 'multifactorAuthentication.reason.expoErrors.noAuthentication',
        [EXPO_ERRORS.SEARCH_STRING.OLD_ANDROID]: 'multifactorAuthentication.reason.expoErrors.oldAndroid',
    },
} as const;

const MULTIFACTOR_AUTHENTICATION_VALUES = {
    /** Name of the service associated with the keys in SecureStore */
    KEYCHAIN_SERVICE: 'Expensify',
    /** Type sent to the API to indicate that ED25519 was used */
    ED25519_TYPE: 'biometrics',
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
    RESPONSE_TRANSLATION_PATH,
} as const;

export {MultifactorAuthenticationCallbacks, MULTIFACTOR_AUTHENTICATION_ERROR_MAPPINGS};
export default MULTIFACTOR_AUTHENTICATION_VALUES;

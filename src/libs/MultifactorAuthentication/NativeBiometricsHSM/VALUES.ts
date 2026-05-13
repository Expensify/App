/**
 * Constants specific to native biometrics (HSM / react-native-biometrics).
 */
import {AuthType} from '@sbaiahmed1/react-native-biometrics/types';
import MARQETA_VALUES from '@libs/MultifactorAuthentication/shared/MarqetaValues';

const NATIVE_BIOMETRICS_HSM_VALUES = {
    /**
     * HSM key type identifier sent in API requests to identify the HSM-backed biometric authentication method.
     */
    BIOMETRICS_HSM_TYPE: 'biometric-hsm',

    /**
     * Key alias suffix for HSM keys managed by react-native-biometrics.
     */
    HSM_KEY_SUFFIX: 'HSM_KEY',

    /**
     * Authentication types mapped to Marqeta values
     */
    AUTH_TYPE: {
        UNKNOWN: {
            CODE: AuthType.Unknown,
            NAME: 'Unknown',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.KNOWLEDGE_BASED,
        },
        NONE: {
            CODE: AuthType.None,
            NAME: 'None',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.NONE,
        },
        CREDENTIALS: {
            CODE: AuthType.DeviceCredentials,
            NAME: 'Credentials',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.KNOWLEDGE_BASED,
        },
        BIOMETRICS: {
            CODE: AuthType.Biometrics,
            NAME: 'Biometrics',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.BIOMETRIC_FINGERPRINT,
        },
        FACE_ID: {
            CODE: AuthType.FaceID,
            NAME: 'Face ID',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.BIOMETRIC_FACE,
        },
        TOUCH_ID: {
            CODE: AuthType.TouchID,
            NAME: 'Touch ID',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.BIOMETRIC_FINGERPRINT,
        },
        /**
         * OpticID is reserved by apple, used on Apple Vision Pro and not iOS.
         * It is declared here for completeness but is not currently supported.
         */
        OPTIC_ID: {
            CODE: AuthType.OpticID,
            NAME: 'Optic ID',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.BIOMETRIC_FACE,
        },
    },
    /**
     * Subset of error codes returned by react-native-biometrics.
     *
     * Specified codes are user-actionable or are connected to particular flow:
     * - Cancellation (user/system) — distinguish from failures
     * - Availability/lockout — inform the user why biometrics can't be used
     * - Key/signature errors — trigger re-registration or specific recovery paths
     * - Authentication failed — biometric match failure (wrong finger/face)
     *
     * Codes not listed here (INVALID_INPUT_ENCODING, INVALID_KEY_TYPE, etc.) are mainly implementation errors
     * that fallback to REASON.LOCAL_ERRORS.HSM.UNRECOGNIZED.
     *
     * signWithOptions resolves with { errorCode?: string }.
     * createKeys/deleteKeys/getAllKeys reject with Error objects having { code: string, message: string }.
     */
    ERROR_CODE: {
        // User cancellation
        USER_CANCEL: 'USER_CANCEL', // iOS
        USER_CANCELED: 'USER_CANCELED', // Android

        // Biometric not available
        BIOMETRY_NOT_AVAILABLE: 'BIOMETRY_NOT_AVAILABLE', // iOS
        BIOMETRIC_NOT_AVAILABLE: 'BIOMETRIC_NOT_AVAILABLE', // Android (signWithOptions)
        BIOMETRIC_UNAVAILABLE: 'BIOMETRIC_UNAVAILABLE', // Android (BiometricPrompt)

        // Lockout
        BIOMETRY_LOCKOUT: 'BIOMETRY_LOCKOUT', // iOS
        BIOMETRIC_LOCKOUT: 'BIOMETRIC_LOCKOUT', // Android
        BIOMETRY_LOCKOUT_PERMANENT: 'BIOMETRY_LOCKOUT_PERMANENT', // iOS
        BIOMETRIC_LOCKOUT_PERMANENT: 'BIOMETRIC_LOCKOUT_PERMANENT', // Android

        // Signature/key errors
        SIGNATURE_CREATION_FAILED: 'SIGNATURE_CREATION_FAILED',
        KEY_NOT_FOUND: 'KEY_NOT_FOUND',
        CREATE_KEYS_ERROR: 'CREATE_KEYS_ERROR',
        KEY_ALREADY_EXISTS: 'KEY_ALREADY_EXISTS',
        KEY_ACCESS_FAILED: 'KEY_ACCESS_FAILED',

        // Authentication failed
        AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED', // Both

        // System cancel
        SYSTEM_CANCEL: 'SYSTEM_CANCEL', // iOS
        SYSTEM_CANCELED: 'SYSTEM_CANCELED', // Android
    },
} as const;

export default NATIVE_BIOMETRICS_HSM_VALUES;

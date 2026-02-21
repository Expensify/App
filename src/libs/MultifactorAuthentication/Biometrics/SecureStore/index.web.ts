import MARQETA_VALUES from './MarqetaValues';
import type {SecureStoreMethods, SecureStoreValues} from './types';

/**
 * Web polyfill values mirroring the native SecureStore API for multifactor authentication.
 * Provides stable auth type codes and configuration flags for non-native environments.
 */
const SECURE_STORE_VALUES = {
    AUTH_TYPE: {
        UNKNOWN: {
            CODE: -1,
            NAME: 'Unknown',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.OTHER,
        },
        NONE: {
            CODE: 0,
            NAME: 'None',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.OTHER,
        },
        CREDENTIALS: {
            CODE: 1,
            NAME: 'Credentials',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.KNOWLEDGE_BASED,
        },
        BIOMETRICS: {
            CODE: 2,
            NAME: 'Biometrics',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.BIOMETRIC_FINGERPRINT,
        },
        FACE_ID: {
            CODE: 3,
            NAME: 'Face ID',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.BIOMETRIC_FACE,
        },
        TOUCH_ID: {
            CODE: 4,
            NAME: 'Touch ID',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.BIOMETRIC_FINGERPRINT,
        },
        OPTIC_ID: {
            CODE: 5,
            NAME: 'Optic ID',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.OTHER,
        },
    },
    WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: -1,
} as const satisfies SecureStoreValues;

/**
 * Web-safe polyfill implementations of SecureStore methods used by multifactor authentication.
 * Always report that secure auth is unavailable and operate on no-op async calls.
 */
const SECURE_STORE_METHODS = {
    canUseBiometricAuthentication: () => false,
    canUseDeviceCredentialsAuthentication: () => false,
    getItemAsync: async () => [null, 0],
    setItemAsync: async () => 0,
    deleteItemAsync: async () => {},
} as const satisfies SecureStoreMethods;

type SecureStoreOptions = Record<string, unknown>;

export {SECURE_STORE_METHODS, SECURE_STORE_VALUES};
export type {SecureStoreOptions};

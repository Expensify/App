/**
 * Web polyfill values mirroring the native SecureStore API for multifactor authentication.
 * Provides stable auth type codes and configuration flags for non-native environments.
 */
const SECURE_STORE_VALUES = {
    AUTH_TYPE: {
        UNKNOWN: {
            CODE: -1,
            NAME: 'Unknown',
        },
        NONE: {
            CODE: 0,
            NAME: 'None',
        },
        CREDENTIALS: {
            CODE: 1,
            NAME: 'Credentials',
        },
        BIOMETRICS: {
            CODE: 2,
            NAME: 'Biometrics',
        },
        FACE_ID: {
            CODE: 3,
            NAME: 'FaceID',
        },
        TOUCH_ID: {
            CODE: 4,
            NAME: 'TouchID',
        },
        OPTIC_ID: {
            CODE: 5,
            NAME: 'OpticID',
        },
    },
    WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: -1,
} as const;

/**
 * Web-safe polyfill implementations of SecureStore methods used by multifactor authentication.
 * Always report that secure auth is unavailable and operate on no-op async calls.
 */
const SECURE_STORE_METHODS = {
    canUseBiometricAuthentication: () => false,
    canUseDeviceCredentialsAuthentication: () => false,
    /* eslint-disable @typescript-eslint/no-unused-vars */
    getItemAsync: async (key: string, options: Record<string, unknown>) => [null, 0],
    setItemAsync: async (key: string, value: string, options: Record<string, unknown>) => 0,
    deleteItemAsync: async (key: string, options: Record<string, unknown>) => {},
    /* eslint-enable @typescript-eslint/no-unused-vars */
};

type SecureStoreOptions = Record<string, unknown>;

export {SECURE_STORE_METHODS, SECURE_STORE_VALUES};
export type {SecureStoreOptions};

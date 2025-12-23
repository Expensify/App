/** Type of used authentication method returned by the SecureStore mapped to names */
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

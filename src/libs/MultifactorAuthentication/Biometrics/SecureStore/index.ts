import * as SecureStore from 'expo-secure-store';

/** Type of used authentication method returned by the SecureStore mapped to names */
const SECURE_STORE_VALUES = {
    AUTH_TYPE: {
        UNKNOWN: {
            CODE: SecureStore.AUTH_TYPE.UNKNOWN,
            NAME: 'Unknown',
        },
        NONE: {
            CODE: SecureStore.AUTH_TYPE.NONE,
            NAME: 'None',
        },
        CREDENTIALS: {
            CODE: SecureStore.AUTH_TYPE.CREDENTIALS,
            NAME: 'Credentials',
        },
        BIOMETRICS: {
            CODE: SecureStore.AUTH_TYPE.BIOMETRICS,
            NAME: 'Biometrics',
        },
        FACE_ID: {
            CODE: SecureStore.AUTH_TYPE.FACE_ID,
            NAME: 'FaceID',
        },
        TOUCH_ID: {
            CODE: SecureStore.AUTH_TYPE.TOUCH_ID,
            NAME: 'TouchID',
        },
        OPTIC_ID: {
            CODE: SecureStore.AUTH_TYPE.OPTIC_ID,
            NAME: 'OpticID',
        },
    } satisfies Record<
        string,
        {
            CODE: SecureStore.AuthType;
            NAME: string;
        }
    >,
    WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
} as const;

const SECURE_STORE_METHODS = {
    canUseBiometricAuthentication: SecureStore.canUseBiometricAuthentication,
    canUseDeviceCredentialsAuthentication: SecureStore.canUseDeviceCredentialsAuthentication,
    getItemAsync: SecureStore.getItemAsync,
    setItemAsync: SecureStore.setItemAsync,
    deleteItemAsync: SecureStore.deleteItemAsync,
};

type SecureStoreOptions = SecureStore.SecureStoreOptions;

export {SECURE_STORE_METHODS, SECURE_STORE_VALUES};
export type {SecureStoreOptions};

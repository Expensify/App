import * as SecureStore from 'expo-secure-store';
import type {SecureStoreMethods, SecureStoreValues} from './types';

/**
 * Platform SecureStore constants used by the multifactor authentication biometrics flow.
 * Normalizes supported auth types and storage policies exposed by `expo-secure-store`.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/securestore/
 */
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
        /**
         * OpticID is reserved by apple, used on Apple Vision Pro and not iOS.
         * It is declared here for completeness but is not currently supported.
         */
        OPTIC_ID: {
            CODE: SecureStore.AUTH_TYPE.OPTIC_ID,
            NAME: 'OpticID',
        },
    },
    /**
     * A flag that ensures data is stored securely and is only accessible
     * when the device has at least passcode set and is currently unlocked.
     */
    WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
} as const satisfies SecureStoreValues;

/**
 * Thin wrapper around SecureStore methods used by multifactor authentication.
 * Centralizes calls so they can be mocked or swapped on non-native platforms.
 */
const SECURE_STORE_METHODS = {
    canUseBiometricAuthentication: SecureStore.canUseBiometricAuthentication,
    canUseDeviceCredentialsAuthentication: SecureStore.canUseDeviceCredentialsAuthentication,
    getItemAsync: SecureStore.getItemAsync,
    setItemAsync: SecureStore.setItemAsync,
    deleteItemAsync: SecureStore.deleteItemAsync,
} satisfies SecureStoreMethods;

type SecureStoreOptions = SecureStore.SecureStoreOptions;

export {SECURE_STORE_METHODS, SECURE_STORE_VALUES};
export type {SecureStoreOptions};

/**
 * Common type definitions for SecureStore implementations used by multifactor authentication.
 * Shared between native and web polyfill implementations.
 */

/**
 * Authentication type information containing both the numeric code and human-readable name.
 */
type AuthTypeInfo = {
    CODE: number;
    NAME: string;
};

/**
 * Mapping of authentication type names to their corresponding codes and names.
 */
type AuthTypeMap = {
    UNKNOWN: AuthTypeInfo;
    NONE: AuthTypeInfo;
    CREDENTIALS: AuthTypeInfo;
    BIOMETRICS: AuthTypeInfo;
    FACE_ID: AuthTypeInfo;
    TOUCH_ID: AuthTypeInfo;
    OPTIC_ID: AuthTypeInfo;
};

/**
 * Exposed flags for the secure store.
 */
type SecureStoreFlags = {
    WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: number;
};

/**
 * Object containing both the authentication type map and the flags for the secure store.
 */
type SecureStoreValues = {
    AUTH_TYPE: AuthTypeMap;
} & SecureStoreFlags;

/**
 * SecureStore configuration options.
 * On native platforms, this maps to expo-secure-store's SecureStoreOptions.
 * On web, this is a generic record for polyfill compatibility.
 */
type SecureStoreOptions = Record<string, unknown>;

/**
 * Methods for the secure store.
 * This type is used to satisfy both native and web polyfill implementations.
 * For details on the methods, see the expo-secure-store documentation.
 */
type SecureStoreMethods = {
    canUseBiometricAuthentication: () => boolean;
    canUseDeviceCredentialsAuthentication: () => boolean;
    getItemAsync: (key: string, options: SecureStoreOptions) => Promise<[string | null, number] | (string | null)>;
    setItemAsync: (key: string, value: string, options: SecureStoreOptions) => Promise<number | void>;
    deleteItemAsync: (key: string, options: SecureStoreOptions) => Promise<void>;
};

export type {SecureStoreValues, SecureStoreMethods};

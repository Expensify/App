/**
 * Keychain accessibility levels
 * Controls when the keychain item can be accessed
 */
enum KeychainAccessible {
    /** Item data can only be accessed while the device is unlocked */
    WhenUnlocked = 5,
    /** Item data can only be accessed once the device has been unlocked after a restart */
    AfterFirstUnlock = 0,
    /** Item data can be accessed after first unlock; not migrated to new devices */
    AfterFirstUnlockThisDeviceOnly = 1,
    /** Item data can always be accessed (deprecated - not recommended) */
    Always = 2,
    /** Item data can only be accessed when device has a passcode set; not migrated to new devices */
    WhenPasscodeSetThisDeviceOnly = 3,
    /** Item data can always be accessed; not migrated to new devices (deprecated) */
    AlwaysThisDeviceOnly = 4,
    /** Item data can only be accessed while unlocked; not migrated to new devices */
    WhenUnlockedThisDeviceOnly = 6,
}

/**
 * Options for SecureStore operations
 */
type SecureStoreOptions = {
    /** Prompt message for authentication (required when requireAuthentication is true) */
    authenticationPrompt?: string;
    /** When the keychain item can be accessed */
    keychainAccessible?: KeychainAccessible;
    /** Service name for keychain item (defaults to "app") */
    keychainService?: string;
    /**
     * Whether to require biometric/device authentication to access the item
     * Default: true - authentication is required by default for security
     * Set to false explicitly to disable authentication requirement
     */
    requireAuthentication?: boolean;
    /** Keychain access group for sharing between apps */
    accessGroup?: string;
};

/**
 * Default options that enforce authentication
 */
const DEFAULT_SECURE_STORE_OPTIONS: SecureStoreOptions = {
    requireAuthentication: true,
    authenticationPrompt: 'Authenticate to access secure data',
    keychainAccessible: KeychainAccessible.WhenUnlockedThisDeviceOnly,
};

type SecureStoreAPI = {
    set: (key: string, value: string, options?: SecureStoreOptions) => Promise<void>;
    get: (key: string, options?: SecureStoreOptions) => string | null;
    delete: (key: string, options?: SecureStoreOptions) => void;
    canUseAuthentication: () => boolean;
};

type SecureStoreAddonNative = {
    SecureStoreAddon: new () => SecureStoreAPI;
};

type ElectronWindow = Window &
    typeof globalThis & {
        electron?: {
            secureStore?: SecureStoreAPI;
        };
    };

export {KeychainAccessible, DEFAULT_SECURE_STORE_OPTIONS};
export type {SecureStoreAPI, SecureStoreOptions, SecureStoreAddonNative, ElectronWindow};

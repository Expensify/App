import {DEFAULT_SECURE_STORE_OPTIONS} from '../../secureStoreTypes';
import type {SecureStoreAPI, SecureStoreOptions, SecureStoreAddonNative} from '../../secureStoreTypes';

export type {SecureStoreOptions};
export {KeychainAccessible, DEFAULT_SECURE_STORE_OPTIONS} from '../../secureStoreTypes';

/**
 * Merges user options with default secure options
 * Ensures authentication is required by default unless explicitly disabled
 */
const mergeWithDefaults = (options?: SecureStoreOptions): SecureStoreOptions => {
    if (!options) {
        return DEFAULT_SECURE_STORE_OPTIONS;
    }

    return {
        ...DEFAULT_SECURE_STORE_OPTIONS,
        ...options,
    };
};

class SecureStore {
    private addon: SecureStoreAPI;

    constructor() {
        if (process.platform !== 'darwin') {
            throw new Error('SecureStore is only available on macOS');
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const native = require('bindings')('secure_store_addon') as SecureStoreAddonNative;
        this.addon = new native.SecureStoreAddon();
    }

    /**
     * Store a value securely in the macOS Keychain
     * @param key - The key to store the value under
     * @param value - The value to store
     * @param options - Optional configuration for the keychain item (defaults to requiring authentication)
     * @returns Promise that resolves when the value is stored
     */
    async set(key: string, value: string, options?: SecureStoreOptions): Promise<void> {
        const mergedOptions = mergeWithDefaults(options);
        await this.addon.set(key, value, mergedOptions);
    }

    /**
     * Retrieve a value from the macOS Keychain
     * @param key - The key to retrieve
     * @param options - Optional configuration for retrieving the keychain item (defaults to requiring authentication)
     * @returns The stored value or null if not found
     */
    get(key: string, options?: SecureStoreOptions): string | null {
        const mergedOptions = mergeWithDefaults(options);
        return this.addon.get(key, mergedOptions);
    }

    /**
     * Delete a value from the macOS Keychain
     * @param key - The key to delete
     * @param options - Optional configuration for deleting the keychain item
     */
    delete(key: string, options?: SecureStoreOptions): void {
        const mergedOptions = mergeWithDefaults(options);
        this.addon.delete(key, mergedOptions);
    }

    /**
     * Check if biometric/device authentication is available
     * @returns true if authentication is supported
     */
    canUseAuthentication(): boolean {
        return this.addon.canUseAuthentication();
    }
}

const secureStore: SecureStoreAPI =
    process.platform === 'darwin'
        ? new SecureStore()
        : {
              set: async () => {
                  throw new Error('SecureStore is only available on macOS');
              },
              get: () => {
                  throw new Error('SecureStore is only available on macOS');
              },
              delete: () => {
                  throw new Error('SecureStore is only available on macOS');
              },
              canUseAuthentication: () => {
                  throw new Error('SecureStore is only available on macOS');
              },
          };

export default secureStore;

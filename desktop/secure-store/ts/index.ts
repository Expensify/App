type SecureStoreAddon = {
    set(key: string, value: string): void;
    get(key: string): string | null;
    delete(key: string): void;
};

type SecureStoreNative = {
    SecureStoreAddon: new () => SecureStoreAddon;
};

class SecureStore {
    private addon: SecureStoreAddon;

    constructor() {
        if (process.platform !== 'darwin') {
            throw new Error('SecureStore is only available on macOS');
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const native = require('bindings')('secure_store_addon') as SecureStoreNative;
        this.addon = new native.SecureStoreAddon();
    }

    /**
     * Store a value securely
     * @param key - The key to store the value under
     * @param value - The value to store
     */
    set(key: string, value: string): void {
        this.addon.set(key, value);
    }

    /**
     * Retrieve a value from secure storage
     * @param key - The key to retrieve
     * @returns The stored value or null if not found
     */
    get(key: string): string | null {
        return this.addon.get(key);
    }

    /**
     * Delete a value from secure storage
     * @param key - The key to delete
     */
    delete(key: string): void {
        this.addon.delete(key);
    }
}

type SecureStoreInterface = {
    set(key: string, value: string): void;
    get(key: string): string | null;
    delete(key: string): void;
};

const secureStore: SecureStoreInterface =
    process.platform === 'darwin'
        ? new SecureStore()
        : {
              set: () => {
                  throw new Error('SecureStore is only available on macOS');
              },
              get: () => {
                  throw new Error('SecureStore is only available on macOS');
              },
              delete: () => {
                  throw new Error('SecureStore is only available on macOS');
              },
          };

export default secureStore;
module.exports = secureStore;

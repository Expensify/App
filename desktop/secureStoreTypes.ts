type SecureStoreAPI = {
    set: (key: string, value: string) => void;
    get: (key: string) => string | null;
    delete: (key: string) => void;
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

export type {SecureStoreAPI, SecureStoreAddonNative, ElectronWindow};

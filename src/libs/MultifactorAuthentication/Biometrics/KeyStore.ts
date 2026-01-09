import {decodeExpoMessage} from './helpers';
import {SECURE_STORE_METHODS, SECURE_STORE_VALUES} from './SecureStore';
import type {SecureStoreOptions} from './SecureStore';
import type {MultifactorAuthenticationKeyType, MultifactorAuthenticationPartialStatus, MultifactorKeyStoreOptions} from './types';
import VALUES from './VALUES';

const STATIC_OPTIONS = {
    keychainService: VALUES.KEYCHAIN_SERVICE,
    keychainAccessible: SECURE_STORE_VALUES.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
    enableDeviceFallback: true,
    returnUsedAuthenticationType: true,
} as const;

const secureStoreOptions = (key: string, KSOptions?: MultifactorKeyStoreOptions): SecureStoreOptions => {
    const isPrivateKey = key.endsWith(VALUES.KEY_ALIASES.PRIVATE_KEY);

    return {
        failOnUpdate: isPrivateKey,
        requireAuthentication: isPrivateKey,
        forceAuthenticationOnSave: isPrivateKey,
        forceReadAuthenticationOnSimulators: isPrivateKey,
        authenticationPrompt: KSOptions?.nativePromptTitle ?? 'Approve transaction',
    };
};

const MultifactorAuthenticationStore = {
    get: (key: string, KSOptions?: MultifactorKeyStoreOptions) => SECURE_STORE_METHODS.getItemAsync(key, {...secureStoreOptions(key, KSOptions), ...STATIC_OPTIONS}),
    set: (key: string, value: string, KSOptions?: MultifactorKeyStoreOptions) => SECURE_STORE_METHODS.setItemAsync(key, value, {...secureStoreOptions(key, KSOptions), ...STATIC_OPTIONS}),
    delete: (key: string) =>
        SECURE_STORE_METHODS.deleteItemAsync(key, {
            keychainService: VALUES.KEYCHAIN_SERVICE,
        }),
};

class MultifactorAuthenticationKeyStore {
    constructor(private readonly key: MultifactorAuthenticationKeyType) {}

    public async set(accountID: number, value: string, KSOptions?: MultifactorKeyStoreOptions): Promise<MultifactorAuthenticationPartialStatus<boolean, true>> {
        try {
            const type = await MultifactorAuthenticationStore.set(`${accountID}_${this.key}`, value, KSOptions);
            return {
                value: true,
                reason: VALUES.REASON.KEYSTORE.KEY_SAVED,
                type,
            };
        } catch (error) {
            return {
                value: false,
                reason: decodeExpoMessage(error, VALUES.REASON.KEYSTORE.UNABLE_TO_SAVE_KEY),
            };
        }
    }

    public async delete(accountID: number): Promise<MultifactorAuthenticationPartialStatus<boolean, true>> {
        try {
            await MultifactorAuthenticationStore.delete(`${accountID}_${this.key}`);
            return {
                value: true,
                reason: VALUES.REASON.KEYSTORE.KEY_DELETED,
            };
        } catch (error) {
            return {
                value: false,
                reason: decodeExpoMessage(error, VALUES.REASON.KEYSTORE.UNABLE_TO_DELETE_KEY),
            };
        }
    }

    public async get(accountID: number, KSOptions?: MultifactorKeyStoreOptions): Promise<MultifactorAuthenticationPartialStatus<string | null, true>> {
        try {
            const [key, type] = await MultifactorAuthenticationStore.get(`${accountID}_${this.key}`, KSOptions);
            return {
                value: key,
                reason: key ? VALUES.REASON.KEYSTORE.KEY_RETRIEVED : VALUES.REASON.KEYSTORE.KEY_NOT_FOUND,
                type,
            };
        } catch (error) {
            return {
                value: null,
                reason: decodeExpoMessage(error, VALUES.REASON.KEYSTORE.UNABLE_TO_RETRIEVE_KEY),
            };
        }
    }

    get supportedAuthentication() {
        return {biometrics: SECURE_STORE_METHODS.canUseBiometricAuthentication(), credentials: SECURE_STORE_METHODS.canUseDeviceCredentialsAuthentication()};
    }
}

const MultifactorAuthenticationPrivateKeyStore = new MultifactorAuthenticationKeyStore(VALUES.KEY_ALIASES.PRIVATE_KEY);

const MultifactorAuthenticationPublicKeyStore = new MultifactorAuthenticationKeyStore(VALUES.KEY_ALIASES.PUBLIC_KEY);

export {MultifactorAuthenticationPrivateKeyStore as PrivateKeyStore, MultifactorAuthenticationPublicKeyStore as PublicKeyStore};

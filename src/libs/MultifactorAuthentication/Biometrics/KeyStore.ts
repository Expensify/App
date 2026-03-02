/**
 * Manages secure storage and retrieval of cryptographic keys for multifactor authentication.
 */
import {decodeExpoMessage} from './helpers';
import {SECURE_STORE_METHODS, SECURE_STORE_VALUES} from './SecureStore';
import type {SecureStoreOptions} from './SecureStore';
import type {MultifactorAuthenticationKeyStoreStatus, MultifactorAuthenticationKeyType, MultifactorKeyStoreOptions} from './types';
import VALUES from './VALUES';

/**
 * Static options for secure store operations.
 */
const STATIC_OPTIONS = {
    keychainService: VALUES.KEYCHAIN_SERVICE,
    keychainAccessible: SECURE_STORE_VALUES.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
    enableDeviceFallback: true,
    returnUsedAuthenticationType: true,
} as const;

/**
 * Configures secure store options based on the key type and provided options.
 * Private keys require additional authentication and are protected from updates.
 */
const secureStoreOptions = <T extends MultifactorAuthenticationKeyType>(key: T, KSOptions: MultifactorKeyStoreOptions<T>): SecureStoreOptions => {
    const isPrivateKey = key === VALUES.KEY_ALIASES.PRIVATE_KEY;

    return {
        failOnUpdate: isPrivateKey,
        requireAuthentication: isPrivateKey,
        forceAuthenticationOnSave: isPrivateKey,
        forceReadAuthenticationOnSimulators: isPrivateKey,
        authenticationPrompt: KSOptions?.nativePromptTitle,
    };
};

/**
 * Manages storage and retrieval of a specific key type (public or private) in secure storage.
 * Handles encryption, authentication, and error management for cryptographic keys.
 */
class MultifactorAuthenticationKeyStore<T extends MultifactorAuthenticationKeyType> {
    constructor(private readonly key: T) {}

    /**
     * Saves a key to secure storage for the given account.
     */
    public async set(accountID: number, value: string, KSOptions: MultifactorKeyStoreOptions<T>): Promise<MultifactorAuthenticationKeyStoreStatus<boolean>> {
        try {
            const alias = `${accountID}_${this.key}`;
            const type = await SECURE_STORE_METHODS.setItemAsync(alias, value, {...secureStoreOptions(this.key, KSOptions), ...STATIC_OPTIONS});
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

    /**
     * Deletes a key from secure storage for the given account.
     */
    public async delete(accountID: number): Promise<MultifactorAuthenticationKeyStoreStatus<boolean>> {
        try {
            const alias = `${accountID}_${this.key}`;
            await SECURE_STORE_METHODS.deleteItemAsync(alias, {
                keychainService: VALUES.KEYCHAIN_SERVICE,
            });
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

    /**
     * Retrieves a key from secure storage for the given account with optional authentication.
     */
    public async get(accountID: number, KSOptions: MultifactorKeyStoreOptions<T>): Promise<MultifactorAuthenticationKeyStoreStatus<string | null>> {
        try {
            const alias = `${accountID}_${this.key}`;
            const [key, type] = await SECURE_STORE_METHODS.getItemAsync(alias, {...secureStoreOptions(this.key, KSOptions), ...STATIC_OPTIONS});
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

    /**
     * Checks what authentication methods are supported on this device.
     */
    get supportedAuthentication() {
        return {biometrics: SECURE_STORE_METHODS.canUseBiometricAuthentication(), credentials: SECURE_STORE_METHODS.canUseDeviceCredentialsAuthentication()};
    }
}

/**
 * Store instance for managing private keys.
 */
const MultifactorAuthenticationPrivateKeyStore = new MultifactorAuthenticationKeyStore(VALUES.KEY_ALIASES.PRIVATE_KEY);

/**
 * Store instance for managing public keys.
 */
const MultifactorAuthenticationPublicKeyStore = new MultifactorAuthenticationKeyStore(VALUES.KEY_ALIASES.PUBLIC_KEY);

export {MultifactorAuthenticationPrivateKeyStore as PrivateKeyStore, MultifactorAuthenticationPublicKeyStore as PublicKeyStore};

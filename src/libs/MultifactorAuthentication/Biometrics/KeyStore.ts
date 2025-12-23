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

/**
 * SecureStore options that control authentication requirements.
 * Private keys require multifactorial authentication/credential auth, while public keys don't.
 * Also configures keychain access and credential alternatives.
 */
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

/**
 * Provides secure storage for multifactorial authentication keys with authentication controls.
 * Handles CRUD operations on the SecureStore with error handling and feedback support.
 * Returns standardized response objects containing operation status, reason messages, and auth type.
 *
 * The class is used internally to create two specialized stores:
 * - MultifactorAuthenticationPrivateKeyStore: Requires biometric/credential auth for access
 * - MultifactorAuthenticationPublicKeyStore: Allows access without authentication
 */
class MultifactorAuthenticationKeyStore {
    constructor(private readonly key: MultifactorAuthenticationKeyType) {}

    /**
     * Stores a value in SecureStore. For private keys, this will trigger an auth prompt.
     * Returns success/failure status with a reason message and auth type used.
     */
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

    /**
     * Removes a value from SecureStore.
     * Returns success/failure status with a reason message.
     */
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

    /**
     * Retrieves a value from SecureStore. For private keys, this will trigger an auth prompt.
     * Returns the stored value (or null) with a reason message and auth type used.
     */
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

    /**
     * Checks device support for different authentication methods.
     * Returns whether biometrics authentication and device credentials can be used.
     */
    get supportedAuthentication() {
        return {biometrics: SECURE_STORE_METHODS.canUseBiometricAuthentication(), credentials: SECURE_STORE_METHODS.canUseDeviceCredentialsAuthentication()};
    }
}

/**
 * Secure storage for the private key that requires multifactorial authentication/credential authentication.
 * All operations (get/set) will trigger an authentication prompt.
 */
const MultifactorAuthenticationPrivateKeyStore = new MultifactorAuthenticationKeyStore(VALUES.KEY_ALIASES.PRIVATE_KEY);

/**
 * Storage for the public key that can be accessed without authentication.
 * Provides the same interface as MultifactorAuthenticationPrivateKeyStore but without auth requirements.
 */
const MultifactorAuthenticationPublicKeyStore = new MultifactorAuthenticationKeyStore(VALUES.KEY_ALIASES.PUBLIC_KEY);

export {MultifactorAuthenticationPrivateKeyStore as PrivateKeyStore, MultifactorAuthenticationPublicKeyStore as PublicKeyStore};

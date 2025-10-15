import * as SecureStore from 'expo-secure-store';
import type {TranslationPaths} from '@src/languages/types';
import {decodeExpoMessage} from './helpers';
import type {MultifactorAuthenticationKeyType, MultifactorAuthenticationPartialStatus} from './types';
import VALUES from './VALUES';

/**
 * SecureStore options that control authentication requirements.
 * Private keys require multifactorial authentication/credential auth, while public keys don't.
 * Also configures keychain access and credential alternatives.
 */
const options = (key: string): SecureStore.SecureStoreOptions => {
    const isPrivateKey = key === VALUES.KEY_ALIASES.PRIVATE_KEY;
    return {
        failOnDuplicate: isPrivateKey,
        requireAuthentication: isPrivateKey,
        askForAuthOnSave: isPrivateKey,
        keychainService: VALUES.KEYCHAIN_SERVICE,
        keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
        enableCredentialsAlternative: true,
    };
};

const MultifactorAuthenticationStore = {
    get: (key: string) => SecureStore.getItemAsync(key, options(key)),
    set: (key: string, value: string) => SecureStore.setItemAsync(key, value, options(key)),
    delete: (key: string) =>
        SecureStore.deleteItemAsync(key, {
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
    public async set(value: string): Promise<MultifactorAuthenticationPartialStatus<boolean, true>> {
        try {
            const type = await MultifactorAuthenticationStore.set(this.key, value);
            return {
                value: true,
                reason: 'multifactorAuthentication.reason.success.keySavedInSecureStore' as TranslationPaths,
                type,
            };
        } catch (error) {
            return {
                value: false,
                reason: decodeExpoMessage(error, 'multifactorAuthentication.reason.error.unableToSaveKey'),
            };
        }
    }

    /**
     * Removes a value from SecureStore.
     * Returns success/failure status with a reason message.
     */
    public async delete(): Promise<MultifactorAuthenticationPartialStatus<boolean, true>> {
        try {
            await MultifactorAuthenticationStore.delete(this.key);
            return {
                value: true,
                reason: 'multifactorAuthentication.reason.success.keyDeletedFromSecureStore' as TranslationPaths,
            };
        } catch (error) {
            return {
                value: false,
                reason: decodeExpoMessage(error, 'multifactorAuthentication.reason.error.unableToDelete'),
            };
        }
    }

    /**
     * Retrieves a value from SecureStore. For private keys, this will trigger an auth prompt.
     * Returns the stored value (or null) with a reason message and auth type used.
     */
    public async get(): Promise<MultifactorAuthenticationPartialStatus<string | null, true>> {
        try {
            const [key, type] = await MultifactorAuthenticationStore.get(this.key);
            return {
                value: key,
                reason: `multifactorAuthentication.reason.success.${key ? 'keyRetrievedFromSecureStore' : 'keyNotInSecureStore'}`,
                type,
            };
        } catch (error) {
            return {
                value: null,
                reason: decodeExpoMessage(error, 'multifactorAuthentication.reason.error.unableToRetrieve'),
            };
        }
    }

    /**
     * Checks device support for different authentication methods.
     * Returns whether biometrics authentication and device credentials can be used.
     */
    get supportedAuthentication() {
        return {biometrics: SecureStore.canUseBiometricAuthentication(), credentials: SecureStore.canUseDeviceCredentialsAuthentication()};
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

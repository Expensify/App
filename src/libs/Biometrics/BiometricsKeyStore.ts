import * as SecureStore from 'expo-secure-store';
import type {ValueOf} from 'type-fest';
import {BiometricsPartialStatus} from '@hooks/useBiometricsStatus/types';
import decodeBiometricsExpoMessage from '@libs/Biometrics/decodeBiometricsExpoMessage';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

/**
 * Provides secure storage for biometric keys with authentication controls.
 * Handles CRUD operations on the SecureStore with error handling and feedback support.
 * Returns standardized response objects containing operation status, reason messages, and auth type.
 *
 * The class is used internally to create two specialized stores:
 * - BiometricsPrivateKeyStore: Requires biometric/credential auth for access
 * - BiometricsPublicKeyStore: Allows access without authentication
 */
class BiometricsKeyStore {
    constructor(private readonly key: ValueOf<typeof CONST.BIOMETRICS.KEY_ALIASES>) {}

    /**
     * SecureStore options that control authentication requirements.
     * Private keys require biometric/credential auth, while public keys don't.
     * Also configures keychain access and credential alternatives.
     */
    private get options(): SecureStore.SecureStoreOptions {
        const isPrivateKey = this.key === CONST.BIOMETRICS.KEY_ALIASES.PRIVATE_KEY;
        return {
            failOnDuplicate: isPrivateKey,
            requireAuthentication: isPrivateKey,
            askForAuthOnSave: isPrivateKey,
            keychainService: CONST.BIOMETRICS.KEYCHAIN_SERVICE,
            keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
            enableCredentialsAlternative: true,
        };
    }

    /**
     * Checks device support for different authentication methods.
     * Returns whether biometrics and device credentials can be used.
     */
    public get supportedAuthentication() {
        return {
            biometrics: SecureStore.canUseBiometricAuthentication(),
            credentials: SecureStore.canUseDeviceCredentialsAuthentication(),
        };
    }

    /**
     * Stores a value in SecureStore. For private keys, this will trigger an auth prompt.
     * Returns success/failure status with a reason message and auth type used.
     */
    public async set(value: string): Promise<BiometricsPartialStatus<boolean, true>> {
        try {
            const type = await SecureStore.setItemAsync(this.key, value, this.options);
            return {
                value: true,
                reason: 'biometrics.reason.success.keySavedInSecureStore' as TranslationPaths,
                type,
            };
        } catch (error) {
            return {
                value: false,
                reason: decodeBiometricsExpoMessage(error, 'biometrics.reason.error.unableToSaveKey'),
            };
        }
    }

    /**
     * Removes a value from SecureStore.
     * Returns success/failure status with a reason message.
     */
    public async delete(): Promise<BiometricsPartialStatus<boolean, true>> {
        try {
            await SecureStore.deleteItemAsync(this.key, {
                keychainService: CONST.BIOMETRICS.KEYCHAIN_SERVICE,
            });
            return {
                value: true,
                reason: 'biometrics.reason.success.keyDeletedFromSecureStore' as TranslationPaths,
            };
        } catch (error) {
            return {
                value: false,
                reason: decodeBiometricsExpoMessage(error, 'biometrics.reason.error.unableToDelete'),
            };
        }
    }

    /**
     * Retrieves a value from SecureStore. For private keys, this will trigger an auth prompt.
     * Returns the stored value (or null) with a reason message and auth type used.
     */
    public async get(): Promise<BiometricsPartialStatus<string | null, true>> {
        try {
            const [key, type] = await SecureStore.getItemAsync(this.key, this.options);
            return {
                value: key,
                reason: `biometrics.reason.success.${key ? 'keyRetrievedFromSecureStore' : 'keyNotInSecureStore'}` as TranslationPaths,
                type,
            };
        } catch (error) {
            return {
                value: null,
                reason: decodeBiometricsExpoMessage(error, 'biometrics.reason.error.unableToRetrieve'),
            };
        }
    }
}

/**
 * Secure storage for the private key that requires biometric/credential authentication.
 * All operations (get/set) will trigger an authentication prompt.
 */
const BiometricsPrivateKeyStore = new BiometricsKeyStore(CONST.BIOMETRICS.KEY_ALIASES.PRIVATE_KEY);

/**
 * Storage for the public key that can be accessed without authentication.
 * Provides the same interface as BiometricsPrivateKeyStore but without auth requirements.
 */
const BiometricsPublicKeyStore = new BiometricsKeyStore(CONST.BIOMETRICS.KEY_ALIASES.PUBLIC_KEY);

export {BiometricsPrivateKeyStore, BiometricsPublicKeyStore};

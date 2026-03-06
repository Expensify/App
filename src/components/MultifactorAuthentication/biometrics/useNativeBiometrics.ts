import {useCallback} from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import {generateKeyPair, signToken as signTokenED25519} from '@libs/MultifactorAuthentication/Biometrics/ED25519';
import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import {SECURE_STORE_VALUES} from '@libs/MultifactorAuthentication/Biometrics/SecureStore';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import CONST from '@src/CONST';
import type {AuthorizeParams, AuthorizeResult, RegisterResult, UseBiometricsReturn} from './common/types';
import useServerCredentials from './common/useServerCredentials';

/**
 * Clears local credentials to allow re-registration.
 * Should only be used in response to server indicating credentials were removed.
 */
async function resetKeys(accountID: number) {
    await Promise.all([PrivateKeyStore.delete(accountID), PublicKeyStore.delete(accountID)]);
}

/**
 * Determines if biometric authentication is configured locally for the current account.
 * Checks local public key storage and compares with the provided auth public keys.
 * Note: We only check public key here because checking private key requires biometric authentication.
 * If private key is missing, it will be detected during authorize() and trigger re-registration.
 * @param accountID - The account ID to check biometric configuration for.
 * @param authPublicKeys - The list of public keys registered in auth backend (from Onyx).
 * @returns Object indicating if biometry is locally configured and if local key is in auth.
 */
async function isBiometryConfigured(accountID: number, authPublicKeys: string[] = []) {
    const {value: localPublicKey} = await PublicKeyStore.get(accountID);

    const isBiometryRegisteredLocally = !!localPublicKey;
    const isLocalPublicKeyInAuth = isBiometryRegisteredLocally && authPublicKeys.includes(localPublicKey);

    return {
        isBiometryRegisteredLocally,
        isLocalPublicKeyInAuth,
    };
}

function useNativeBiometrics(): UseBiometricsReturn {
    const {accountID} = useCurrentUserPersonalDetails();
    const {translate} = useLocalize();
    const {serverHasAnyCredentials, serverKnownCredentialIDs} = useServerCredentials();

    /**
     * Checks if the device supports biometric authentication methods.
     * Verifies both biometrics and credentials authentication capabilities.
     * @returns True if biometrics or credentials authentication is supported on the device.
     */
    const doesDeviceSupportBiometrics = useCallback(() => {
        const {biometrics, credentials} = PublicKeyStore.supportedAuthentication;
        return biometrics || credentials;
    }, []);

    const hasLocalCredentials = useCallback(async () => {
        const config = await isBiometryConfigured(accountID);
        return config.isBiometryRegisteredLocally;
    }, [accountID]);

    const areLocalCredentialsKnownToServer = useCallback(async () => {
        const config = await isBiometryConfigured(accountID, serverKnownCredentialIDs);
        return config.isLocalPublicKeyInAuth;
    }, [accountID, serverKnownCredentialIDs]);

    const resetKeysForAccount = useCallback(async () => {
        await resetKeys(accountID);
    }, [accountID]);

    const register = async (onResult: (result: RegisterResult) => Promise<void> | void) => {
        // Generate key pair
        const {privateKey, publicKey} = generateKeyPair();

        // Delete existing keys before storing new ones to avoid "key already exists" errors
        await Promise.all([PrivateKeyStore.delete(accountID), PublicKeyStore.delete(accountID)]);

        // Store private key
        const privateKeyResult = await PrivateKeyStore.set(accountID, privateKey, {nativePromptTitle: translate('multifactorAuthentication.letsVerifyItsYou')});
        const authTypeEntry = Object.values(SECURE_STORE_VALUES.AUTH_TYPE).find(({CODE}) => CODE === privateKeyResult.type);

        const authType = authTypeEntry
            ? {
                  code: authTypeEntry.CODE,
                  name: authTypeEntry.NAME,
                  marqetaValue: authTypeEntry.MARQETA_VALUE,
              }
            : undefined;

        if (!privateKeyResult.value || authType === undefined) {
            onResult({
                success: false,
                reason: privateKeyResult.reason,
            });
            return;
        }

        // Store public key
        const publicKeyResult = await PublicKeyStore.set(accountID, publicKey);
        if (!publicKeyResult.value) {
            // Delete the private key if public key storage fails to maintain a consistent key pair state.
            // If only the private key exists without a matching public key, the device will be unable to
            // complete authorization later (public key mismatch with server). Clean up to force re-registration
            // on the next attempt when both keys can be successfully stored.
            await PrivateKeyStore.delete(accountID);
            onResult({
                success: false,
                reason: publicKeyResult.reason,
            });
            return;
        }

        // Return success with keys - challenge is passed from Main.tsx
        await onResult({
            success: true,
            reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.LOCAL_REGISTRATION_COMPLETE,
            privateKey,
            publicKey,
            authenticationMethod: authType,
        });
    };

    const authorize = async (params: AuthorizeParams, onResult: (result: AuthorizeResult) => Promise<void> | void) => {
        const {challenge} = params;

        // Extract public keys from challenge.allowCredentials
        const authPublicKeys = challenge.allowCredentials?.map((cred: {id: string; type: string}) => cred.id) ?? [];

        // Get private key from SecureStore
        const privateKeyData = await PrivateKeyStore.get(accountID, {nativePromptTitle: translate('multifactorAuthentication.letsVerifyItsYou')});

        if (!privateKeyData.value) {
            onResult({
                success: false,
                reason: privateKeyData.reason || VALUES.REASON.KEYSTORE.KEY_MISSING,
            });
            return;
        }

        // Get public key
        const {value: publicKey} = await PublicKeyStore.get(accountID);

        if (!publicKey || !authPublicKeys.includes(publicKey)) {
            await resetKeys(accountID);
            onResult({
                success: false,
                reason: VALUES.REASON.KEYSTORE.REGISTRATION_REQUIRED,
            });
            return;
        }

        // Sign the challenge
        const signedChallenge = signTokenED25519(challenge, privateKeyData.value, publicKey);
        const authenticationMethodCode = privateKeyData.type;
        const authTypeEntry = Object.values(SECURE_STORE_VALUES.AUTH_TYPE).find(({CODE}) => CODE === authenticationMethodCode);

        const authType = authTypeEntry
            ? {
                  code: authTypeEntry.CODE,
                  name: authTypeEntry.NAME,
                  marqetaValue: authTypeEntry.MARQETA_VALUE,
              }
            : undefined;

        if (!authType) {
            onResult({
                success: false,
                reason: VALUES.REASON.GENERIC.BAD_REQUEST,
            });
            return;
        }

        // Return signed challenge - let callback handle backend authorization
        await onResult({
            success: true,
            reason: VALUES.REASON.CHALLENGE.CHALLENGE_SIGNED,
            signedChallenge,
            authenticationMethod: authType,
        });
    };

    return {
        serverHasAnyCredentials,
        serverKnownCredentialIDs,
        doesDeviceSupportBiometrics,
        hasLocalCredentials,
        areLocalCredentialsKnownToServer,
        register,
        authorize,
        resetKeysForAccount,
    };
}

export default useNativeBiometrics;

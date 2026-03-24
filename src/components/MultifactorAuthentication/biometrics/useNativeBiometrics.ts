import {useCallback} from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import {generateKeyPair, signToken as signTokenED25519} from '@libs/MultifactorAuthentication/NativeBiometrics/ED25519';
import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/NativeBiometrics/KeyStore';
import {SECURE_STORE_VALUES} from '@libs/MultifactorAuthentication/NativeBiometrics/SecureStore';
import type {NativeBiometricsKeyInfo} from '@libs/MultifactorAuthentication/NativeBiometrics/types';
import type {RegistrationChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';
import VALUES from '@libs/MultifactorAuthentication/VALUES';
import CONST from '@src/CONST';
import Base64URL from '@src/utils/Base64URL';
import type {AuthorizeParams, AuthorizeResult, RegisterResult, UseBiometricsReturn} from './shared/types';
import useServerCredentials from './shared/useServerCredentials';

/**
 * Clears local credentials to allow re-registration.
 * Should only be used in response to server indicating credentials were removed.
 */
async function resetKeys(accountID: number) {
    await Promise.all([PrivateKeyStore.delete(accountID), PublicKeyStore.delete(accountID)]);
}

function useNativeBiometrics(): UseBiometricsReturn {
    const {accountID} = useCurrentUserPersonalDetails();
    const {translate} = useLocalize();
    const {serverKnownCredentialIDs, haveCredentialsEverBeenConfigured} = useServerCredentials();

    /**
     * Checks if the device supports biometric authentication methods.
     * Verifies both biometrics and credentials authentication capabilities.
     * @returns True if biometrics or credentials authentication is supported on the device.
     */
    const doesDeviceSupportAuthenticationMethod = useCallback(() => {
        const {biometrics, credentials} = PublicKeyStore.supportedAuthentication;
        return biometrics || credentials;
    }, []);

    // Only the credential ID is checked here because reading the private key
    // requires biometric authentication. If the private key is missing, it
    // will be detected during authorize() and trigger re-registration.
    const getLocalCredentialID = useCallback(async () => {
        const {value} = await PublicKeyStore.get(accountID);
        return value ?? undefined;
    }, [accountID]);

    const areLocalCredentialsKnownToServer = useCallback(async () => {
        const key = await getLocalCredentialID();
        return !!key && serverKnownCredentialIDs.includes(key);
    }, [getLocalCredentialID, serverKnownCredentialIDs]);

    const deleteLocalKeysForAccount = useCallback(async () => {
        await resetKeys(accountID);
    }, [accountID]);

    const register = async (onResult: (result: RegisterResult) => Promise<void> | void, registrationChallenge: RegistrationChallenge) => {
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

        const clientDataJSON = JSON.stringify({challenge: registrationChallenge.challenge});
        const keyInfo: NativeBiometricsKeyInfo = {
            rawId: publicKey,
            type: CONST.MULTIFACTOR_AUTHENTICATION.ED25519_TYPE,
            response: {
                clientDataJSON: Base64URL.encode(clientDataJSON),
                biometric: {
                    publicKey,
                    algorithm: CONST.COSE_ALGORITHM.EDDSA,
                },
            },
        };

        await onResult({
            success: true,
            reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.LOCAL_REGISTRATION_COMPLETE,
            keyInfo,
            authenticationMethod: authType,
        });
    };

    const authorize = async (params: AuthorizeParams, onResult: (result: AuthorizeResult) => Promise<void> | void) => {
        const {challenge} = params;

        // Extract public keys from challenge.allowCredentials
        const allowedCredentialIDs = challenge.allowCredentials?.map((cred: {id: string; type: string}) => cred.id) ?? [];

        // Get private key from SecureStore
        const privateKeyData = await PrivateKeyStore.get(accountID, {nativePromptTitle: translate('multifactorAuthentication.letsVerifyItsYou')});

        if (!privateKeyData.value) {
            onResult({
                success: false,
                reason: privateKeyData.reason || VALUES.REASON.KEYSTORE.KEY_MISSING,
            });
            return;
        }

        const credentialID = await getLocalCredentialID();

        if (!credentialID || !allowedCredentialIDs.includes(credentialID)) {
            await resetKeys(accountID);
            onResult({
                success: false,
                reason: VALUES.REASON.KEYSTORE.REGISTRATION_REQUIRED,
            });
            return;
        }

        // Sign the challenge
        const signedChallenge = signTokenED25519(challenge, privateKeyData.value, credentialID);
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

    const hasLocalCredentials = async () => !!(await getLocalCredentialID());

    return {
        deviceVerificationType: CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS,
        serverKnownCredentialIDs,
        haveCredentialsEverBeenConfigured,
        getLocalCredentialID,
        doesDeviceSupportAuthenticationMethod,
        hasLocalCredentials,
        areLocalCredentialsKnownToServer,
        register,
        authorize,
        deleteLocalKeysForAccount,
    };
}

export default useNativeBiometrics;

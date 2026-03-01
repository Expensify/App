import {useCallback, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {generateKeyPair, signToken as signTokenED25519} from '@libs/MultifactorAuthentication/Biometrics/ED25519';
import type {AuthenticationChallenge, SignedChallenge} from '@libs/MultifactorAuthentication/Biometrics/ED25519/types';
import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import {SECURE_STORE_VALUES} from '@libs/MultifactorAuthentication/Biometrics/SecureStore';
import type {AuthTypeInfo, MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/Biometrics/types';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account} from '@src/types/onyx';

type BaseRegisterResult = {
    privateKey: string;
    publicKey: string;
    authenticationMethod: AuthTypeInfo;
};

type RegisterResult =
    | ({
          success: true;
          reason: MultifactorAuthenticationReason;
      } & BaseRegisterResult)
    | ({
          success: false;
          reason: MultifactorAuthenticationReason;
      } & Partial<BaseRegisterResult>);

type AuthorizeParams = {
    challenge: AuthenticationChallenge;
};

type AuthorizeResultSuccess = {
    success: true;
    reason: MultifactorAuthenticationReason;
    signedChallenge: SignedChallenge;
    authenticationMethod: AuthTypeInfo;
};

type AuthorizeResultFailure = {
    success: false;
    reason: MultifactorAuthenticationReason;
};

type AuthorizeResult = AuthorizeResultSuccess | AuthorizeResultFailure;

// In the 4th release of the Multifactor Authentication this interface will not focus on the Onyx/Auth values.
// Instead, the providers abstraction will be added.
// For context, see: https://github.com/Expensify/App/pull/79473#discussion_r2747993460
type UseNativeBiometricsReturn = {
    /** Whether server has any registered credentials for this account */
    serverHasAnyCredentials: boolean;

    /** List of credential IDs known to server (from Onyx) */
    serverKnownCredentialIDs: string[];

    /** Whether biometric credentials have ever been configured for this account */
    haveCredentialsEverBeenConfigured: boolean;

    /** Retrieve the public key stored locally on this device */
    getLocalPublicKey: () => Promise<string | undefined>;

    /** Check if device supports biometrics */
    doesDeviceSupportBiometrics: () => boolean;

    /** Check if local credentials are known to server (local credential exists in server's list) */
    areLocalCredentialsKnownToServer: () => Promise<boolean>;

    /** Register biometrics on device */
    register: (onResult: (result: RegisterResult) => Promise<void> | void) => Promise<void>;

    /** Authorize using biometrics */
    authorize: (params: AuthorizeParams, onResult: (result: AuthorizeResult) => Promise<void> | void) => Promise<void>;

    /** Reset keys for account */
    resetKeysForAccount: () => Promise<void>;
};

/**
 * Selector to get multifactor authentication public key IDs from Account Onyx state.
 */
function getMultifactorAuthenticationPublicKeyIDs(data: OnyxEntry<Account>) {
    return data?.multifactorAuthenticationPublicKeyIDs;
}

/**
 * Clears local credentials to allow re-registration.
 * Should only be used in response to server indicating credentials were removed.
 */
async function resetKeys(accountID: number) {
    await Promise.all([PrivateKeyStore.delete(accountID), PublicKeyStore.delete(accountID)]);
}

function useNativeBiometrics(): UseNativeBiometricsReturn {
    const {accountID} = useCurrentUserPersonalDetails();
    const {translate} = useLocalize();

    const [multifactorAuthenticationPublicKeyIDs] = useOnyx(ONYXKEYS.ACCOUNT, {selector: getMultifactorAuthenticationPublicKeyIDs});
    const serverKnownCredentialIDs = useMemo(() => multifactorAuthenticationPublicKeyIDs ?? [], [multifactorAuthenticationPublicKeyIDs]);
    const serverHasAnyCredentials = serverKnownCredentialIDs.length > 0;
    const haveCredentialsEverBeenConfigured = multifactorAuthenticationPublicKeyIDs !== undefined;

    /**
     * Checks if the device supports biometric authentication methods.
     * Verifies both biometrics and credentials authentication capabilities.
     * @returns True if biometrics or credentials authentication is supported on the device.
     */
    const doesDeviceSupportBiometrics = useCallback(() => {
        const {biometrics, credentials} = PublicKeyStore.supportedAuthentication;
        return biometrics || credentials;
    }, []);

    // Only the public key is checked here because reading the private key
    // requires biometric authentication. If the private key is missing, it
    // will be detected during authorize() and trigger re-registration.
    const getLocalPublicKey = useCallback(async () => {
        const {value} = await PublicKeyStore.get(accountID);
        return value ?? undefined;
    }, [accountID]);

    const areLocalCredentialsKnownToServer = useCallback(async () => {
        const key = await getLocalPublicKey();
        return !!key && serverKnownCredentialIDs.includes(key);
    }, [getLocalPublicKey, serverKnownCredentialIDs]);

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

        const publicKey = await getLocalPublicKey();

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
        haveCredentialsEverBeenConfigured,
        getLocalPublicKey,
        doesDeviceSupportBiometrics,
        areLocalCredentialsKnownToServer,
        register,
        authorize,
        resetKeysForAccount,
    };
}

export default useNativeBiometrics;
export type {RegisterResult, AuthorizeParams, AuthorizeResult, UseNativeBiometricsReturn};

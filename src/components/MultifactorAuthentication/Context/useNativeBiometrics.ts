import {useCallback, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from '@components/MultifactorAuthentication/config';
import type {MultifactorAuthenticationScenario} from '@components/MultifactorAuthentication/config/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {generateKeyPair, signToken as signTokenED25519} from '@libs/MultifactorAuthentication/Biometrics/ED25519';
import type {AuthenticationChallenge, SignedChallenge} from '@libs/MultifactorAuthentication/Biometrics/ED25519/types';
import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import {SECURE_STORE_VALUES} from '@libs/MultifactorAuthentication/Biometrics/SecureStore';
import type {MarqetaAuthTypeName, MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/Biometrics/types';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account} from '@src/types/onyx';

type BiometricsInfo = {
    /** Whether device supports biometric authentication */
    deviceSupportsBiometrics: boolean;
};

type RegisterParams = {
    nativePromptTitle: string;
};

type BaseRegisterResult = {
    privateKey: string;
    publicKey: string;
    authenticationMethod: MarqetaAuthTypeName;
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

type AuthorizeParams<T extends MultifactorAuthenticationScenario> = {
    scenario: T;
    challenge: AuthenticationChallenge;
};

type AuthorizeResultSuccess = {
    success: true;
    reason: MultifactorAuthenticationReason;
    signedChallenge: SignedChallenge;
    authenticationMethod: MarqetaAuthTypeName;
};

type AuthorizeResultFailure = {
    success: false;
    reason: MultifactorAuthenticationReason;
};

type AuthorizeResult = AuthorizeResultSuccess | AuthorizeResultFailure;

type UseNativeBiometricsReturn = {
    /** Biometrics info about device and registration status */
    info: BiometricsInfo;

    /** Whether server has any registered credentials for this account */
    serverHasAnyCredentials: boolean;

    /** List of credential IDs known to server (from Onyx) */
    serverKnownCredentialIDs: string[];

    /** Check if device supports biometrics */
    doesDeviceSupportBiometrics: () => boolean;

    /** Check if device has biometric credentials stored locally */
    hasLocalCredentials: () => Promise<boolean>;

    /** Check if local credentials are known to server (local credential exists in server's list) */
    areLocalCredentialsKnownToServer: () => Promise<boolean>;

    /** Register biometrics on device */
    register: (params: RegisterParams, onResult: (result: RegisterResult) => Promise<void> | void) => Promise<void>;

    /** Authorize using biometrics */
    authorize: <T extends MultifactorAuthenticationScenario>(params: AuthorizeParams<T>, onResult: (result: AuthorizeResult) => Promise<void> | void) => Promise<void>;

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

function useNativeBiometrics(): UseNativeBiometricsReturn {
    const {accountID} = useCurrentUserPersonalDetails();
    const {translate} = useLocalize();

    const [multifactorAuthenticationPublicKeyIDs] = useOnyx(ONYXKEYS.ACCOUNT, {selector: getMultifactorAuthenticationPublicKeyIDs, canBeMissing: true});
    const serverKnownCredentialIDs = multifactorAuthenticationPublicKeyIDs ?? [];
    const serverHasAnyCredentials = serverKnownCredentialIDs.length > 0;

    /**
     * Checks if the device supports biometric authentication methods.
     * Verifies both biometrics and credentials authentication capabilities.
     * @returns True if biometrics or credentials authentication is supported on the device.
     */
    const doesDeviceSupportBiometrics = useCallback(() => {
        const {biometrics, credentials} = PublicKeyStore.supportedAuthentication;
        return biometrics || credentials;
    }, []);

    const info = useMemo<BiometricsInfo>(
        () => ({
            deviceSupportsBiometrics: doesDeviceSupportBiometrics(),
        }),
        [doesDeviceSupportBiometrics],
    );

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

    const register = async (params: RegisterParams, onResult: (result: RegisterResult) => Promise<void> | void) => {
        const {nativePromptTitle} = params;

        // Check device support
        if (!doesDeviceSupportBiometrics()) {
            onResult({
                success: false,
                reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.NO_ELIGIBLE_METHODS,
            });
            return;
        }

        // Generate key pair
        const {privateKey, publicKey} = generateKeyPair();

        // Delete existing keys before storing new ones to avoid "key already exists" errors
        await Promise.all([PrivateKeyStore.delete(accountID), PublicKeyStore.delete(accountID)]);

        // Store private key
        const privateKeyResult = await PrivateKeyStore.set(accountID, privateKey, {nativePromptTitle});
        const marqetaAuthType = Object.values(SECURE_STORE_VALUES.AUTH_TYPE).find(({CODE}) => CODE === privateKeyResult.type)?.MQ_VALUE;

        if (!privateKeyResult.value || marqetaAuthType === undefined) {
            onResult({
                success: false,
                reason: privateKeyResult.reason,
            });
            return;
        }

        // Store public key
        const publicKeyResult = await PublicKeyStore.set(accountID, publicKey);
        if (!publicKeyResult.value) {
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
            reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.KEY_PAIR_GENERATED,
            privateKey,
            publicKey,
            authenticationMethod: marqetaAuthType,
        });
    };

    const authorize = async <T extends MultifactorAuthenticationScenario>(params: AuthorizeParams<T>, onResult: (result: AuthorizeResult) => Promise<void> | void) => {
        const {scenario, challenge} = params;

        const {nativePromptTitle: nativePromptTitleTPath} = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario];
        const nativePromptTitle = translate(nativePromptTitleTPath);

        // Extract public keys from challenge.allowCredentials
        const authPublicKeys = challenge.allowCredentials?.map((cred: {id: string; type: string}) => cred.id) ?? [];

        // Get private key from SecureStore
        const privateKeyData = await PrivateKeyStore.get(accountID, {nativePromptTitle});

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
        const marqetaAuthType = Object.values(SECURE_STORE_VALUES.AUTH_TYPE).find(({CODE}) => CODE === authenticationMethodCode)?.MQ_VALUE;

        if (!marqetaAuthType) {
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
            authenticationMethod: marqetaAuthType,
        });
    };

    return {
        info,
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
export type {BiometricsInfo, RegisterParams, RegisterResult, AuthorizeParams, AuthorizeResult, UseNativeBiometricsReturn};

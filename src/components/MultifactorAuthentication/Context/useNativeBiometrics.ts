import {useCallback, useEffect, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from '@components/MultifactorAuthentication/config';
import type {MultifactorAuthenticationScenario} from '@components/MultifactorAuthentication/config/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {generateKeyPair, signToken as signTokenED25519} from '@libs/MultifactorAuthentication/Biometrics/ED25519';
import type {SignedChallenge} from '@libs/MultifactorAuthentication/Biometrics/ED25519/types';
import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import {SECURE_STORE_VALUES} from '@libs/MultifactorAuthentication/Biometrics/SecureStore';
import type {MarqetaAuthTypeName, MultifactorAuthenticationPartialStatus, MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/Biometrics/types';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import {requestAuthenticationChallenge} from '@userActions/MultifactorAuthentication';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account} from '@src/types/onyx';

type BiometricsInfo = {
    /** Whether device supports biometric authentication */
    deviceSupportsBiometrics: boolean;
    /** Whether biometrics is registered locally on this device */
    isBiometryRegisteredLocally: boolean;
    /** Whether local public key exists in auth backend */
    isLocalPublicKeyInAuth: boolean;
};

type RegisterParams = {
    nativePromptTitle: string;
};

type RegisterResult = {
    success: boolean;
    reason: MultifactorAuthenticationReason;
    privateKey?: string;
    publicKey?: string;
    authenticationMethod?: MarqetaAuthTypeName;
    challenge?: string;
};

type AuthorizeParams<T extends MultifactorAuthenticationScenario> = {
    scenario: T;
    chainedPrivateKeyStatus?: MultifactorAuthenticationPartialStatus<string | null, true>;
};

type AuthorizeResult = {
    success: boolean;
    reason: MultifactorAuthenticationReason;
    signedChallenge?: SignedChallenge;
    authenticationMethod?: MarqetaAuthTypeName;
};

type UseNativeBiometricsReturn = {
    /** Biometrics info about device and registration status */
    info: BiometricsInfo;

    /** Whether any device is registered for this account (from Onyx) */
    isAnyDeviceRegistered: boolean;

    /** List of registered public key IDs from backend */
    registeredPublicKeyIDs: string[];

    /** Check if device supports biometrics */
    doesDeviceSupportBiometrics: () => boolean;

    /** Check if biometrics is registered locally */
    isRegisteredLocally: () => boolean;

    /** Check if local public key is in auth backend */
    isRegisteredInAuth: () => boolean;

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
 * Deletes both private and public keys for a given account from secure storage.
 * Performs both deletions in parallel to reset the authentication state.
 * @param accountID - The account ID whose keys should be deleted.
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
    const isAnyDeviceRegistered = !!multifactorAuthenticationPublicKeyIDs?.length;

    /**
     * Checks if the device supports biometric authentication methods.
     * Verifies both biometrics and credentials authentication capabilities.
     * @returns True if biometrics or credentials authentication is supported on the device.
     */
    const doesDeviceSupportBiometrics = useCallback(() => {
        const {biometrics, credentials} = PublicKeyStore.supportedAuthentication;
        return biometrics || credentials;
    }, []);

    const [info, setInfo] = useState<BiometricsInfo>({
        deviceSupportsBiometrics: doesDeviceSupportBiometrics(),
        isBiometryRegisteredLocally: false,
        isLocalPublicKeyInAuth: false,
    });

    const refreshLocalState = useCallback(async () => {
        const config = await isBiometryConfigured(accountID, multifactorAuthenticationPublicKeyIDs ?? []);
        setInfo({
            deviceSupportsBiometrics: doesDeviceSupportBiometrics(),
            isBiometryRegisteredLocally: config.isBiometryRegisteredLocally,
            isLocalPublicKeyInAuth: config.isLocalPublicKeyInAuth,
        });
    }, [accountID, doesDeviceSupportBiometrics, multifactorAuthenticationPublicKeyIDs]);

    useEffect(() => {
        refreshLocalState();
    }, [refreshLocalState]);

    const isRegisteredLocally = () => {
        return info.isBiometryRegisteredLocally;
    };

    const isRegisteredInAuth = () => {
        return info.isLocalPublicKeyInAuth;
    };

    const resetKeysForAccount = async () => {
        await resetKeys(accountID);
        await refreshLocalState();
    };

    const register = async (params: RegisterParams, onResult: (result: RegisterResult) => Promise<void> | void) => {
        const {nativePromptTitle} = params;

        // Request registration challenge from backend first
        const {challenge, reason: challengeReason} = await requestAuthenticationChallenge('registration');

        if (!challenge) {
            const reason = challengeReason === VALUES.REASON.BACKEND.UNKNOWN_RESPONSE ? VALUES.REASON.CHALLENGE.COULD_NOT_RETRIEVE_A_CHALLENGE : challengeReason;
            onResult({
                success: false,
                reason,
            });
            return;
        }

        // Validate that we received a registration challenge (has 'user' and 'rp' properties)
        const isRegistrationChallenge = 'user' in challenge && 'rp' in challenge;
        if (!isRegistrationChallenge) {
            onResult({
                success: false,
                reason: VALUES.REASON.BACKEND.INVALID_CHALLENGE_TYPE,
            });
            return;
        }

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

        // Return success with keys and challenge - let callback handle backend registration
        await onResult({
            success: true,
            reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.KEY_PAIR_GENERATED,
            privateKey,
            publicKey,
            authenticationMethod: marqetaAuthType,
            challenge: challenge.challenge,
        });
    };

    const authorize = async <T extends MultifactorAuthenticationScenario>(params: AuthorizeParams<T>, onResult: (result: AuthorizeResult) => Promise<void> | void) => {
        const {scenario, chainedPrivateKeyStatus} = params;

        const {nativePromptTitle: nativePromptTitleTPath} = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario];
        const nativePromptTitle = translate(nativePromptTitleTPath);

        // Request challenge from backend
        const {challenge, reason: apiReason} = await requestAuthenticationChallenge();

        if (!challenge) {
            const reason = apiReason === VALUES.REASON.BACKEND.UNKNOWN_RESPONSE ? VALUES.REASON.CHALLENGE.COULD_NOT_RETRIEVE_A_CHALLENGE : apiReason;
            onResult({
                success: false,
                reason,
            });
            return;
        }

        // Validate that we received an authentication challenge (has 'allowCredentials' and 'rpId' properties)
        const isAuthenticationChallenge = 'allowCredentials' in challenge && 'rpId' in challenge;
        if (!isAuthenticationChallenge) {
            onResult({
                success: false,
                reason: VALUES.REASON.BACKEND.INVALID_CHALLENGE_TYPE,
            });
            return;
        }

        // Extract public keys from challenge.allowCredentials
        const authPublicKeys = challenge.allowCredentials?.map((cred: {id: string; type: string}) => cred.id) ?? [];

        // Get private key from SecureStore
        // or use chained private key status to avoid authentication prompt displaying twice in a row
        const privateKeyData = chainedPrivateKeyStatus ?? (await PrivateKeyStore.get(accountID, {nativePromptTitle}));

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
        isAnyDeviceRegistered,
        registeredPublicKeyIDs: multifactorAuthenticationPublicKeyIDs ?? [],
        doesDeviceSupportBiometrics,
        isRegisteredLocally,
        isRegisteredInAuth,
        register,
        authorize,
        resetKeysForAccount,
    };
}

export default useNativeBiometrics;
export type {BiometricsInfo, RegisterParams, RegisterResult, AuthorizeParams, AuthorizeResult, UseNativeBiometricsReturn};

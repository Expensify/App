import {useEffect} from 'react';
import {doesDeviceSupportBiometrics, isBiometryConfigured, resetKeys, Status} from '@components/MultifactorAuthentication/helpers';
import type {BiometricsStatus, MultifactorAuthenticationStatusKeyType, Register, UseBiometricsSetup} from '@components/MultifactorAuthentication/types';
import useMultifactorAuthenticationStatus from '@components/MultifactorAuthentication/useMultifactorAuthenticationStatus';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {generateKeyPair} from '@libs/MultifactorAuthentication/Biometrics/ED25519';
import {processRegistration} from '@libs/MultifactorAuthentication/Biometrics/helpers';
import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import type {MultifactorAuthenticationStatus} from '@libs/MultifactorAuthentication/Biometrics/types';
import {revokePublicKeys} from '@userActions/MultifactorAuthentication';
import CONST from '@src/CONST';

/**
 * Core hook that manages biometric authentication setup and state.
 *
 * Handles the complete biometrics registration flow including:
 * - Checking device compatibility
 * - Managing key generation and storage
 * - Coordinating with backend registration
 * - Maintaining authentication state
 *
 * Returns current biometric state and methods to control the setup process.
 */
function useNativeBiometricsSetup(): UseBiometricsSetup {
    /** Tracks whether biometrics is properly configured and ready for authentication */
    const [status, setStatus] = useMultifactorAuthenticationStatus<BiometricsStatus>(
        {
            isBiometryRegisteredLocally: false,
            isAnyDeviceRegistered: false,
            isLocalPublicKeyInAuth: false,
        },
        CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHENTICATION,
    );
    const {accountID} = useCurrentUserPersonalDetails();

    /**
     * Marks the current authentication request as complete.
     * Clears any pending requirements while preserving success/failure state.
     */
    const cancel = (wasRecentStepSuccessful?: boolean) => setStatus(Status.createCancelStatus(wasRecentStepSuccessful));

    /** Memoized check for device biometric capability */
    const deviceSupportBiometrics = doesDeviceSupportBiometrics();

    /**
     * Updates the biometric configuration status by checking for stored public key.
     * Safe to call frequently as it doesn't trigger authentication prompts.
     */
    const refreshStatus = async (overwriteStatus?: Partial<MultifactorAuthenticationStatus<BiometricsStatus>>, overwriteType?: MultifactorAuthenticationStatusKeyType) => {
        const setupStatus = await isBiometryConfigured(accountID);

        const {isLocalPublicKeyInAuth, isAnyDeviceRegistered, isBiometryRegisteredLocally} = setupStatus;

        return setStatus(
            Status.createRefreshStatusStatus(
                {
                    isLocalPublicKeyInAuth,
                    isAnyDeviceRegistered,
                    isBiometryRegisteredLocally,
                },
                overwriteStatus,
            ),
            overwriteType,
        );
    };

    /** Check initial biometric configuration on mount */
    useEffect(() => {
        refreshStatus();
    }, [refreshStatus]);

    /**
     * Resets biometric setup by removing stored keys and refreshing state.
     * Used when keys become invalid or during cleanup.
     */
    const revoke = async () => {
        await resetKeys(accountID);
        await revokePublicKeys();
        return refreshStatus(
            {
                reason: 'multifactorAuthentication.reason.success.keyDeletedFromSecureStore',
                step: {
                    wasRecentStepSuccessful: true,
                    isRequestFulfilled: true,
                    requiredFactorForNextStep: undefined,
                },
            },
            CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.NONE,
        );
    };

    /**
     * Main registration flow for setting up biometric authentication.
     *
     * Flow:
     * 1. Validates device compatibility
     * 2. Ensures validation code is present
     * 3. Generates and stores key pair securely
     * 4. Registers public key with backend
     * 5. Updates local state based on results
     *
     * In chained authentication flows, returns private key on success for immediate use.
     *
     * Note: Will trigger system biometric prompt during key storage.
     */
    const register = (async ({validateCode, chainedWithAuthorization, nativePromptTitle}) => {
        /** Guard unsupported device */
        if (!doesDeviceSupportBiometrics()) {
            return setStatus(Status.createUnsupportedDeviceStatus);
        }

        /** Guard missing validation code and request it */
        if (!validateCode) {
            return setStatus(Status.createValidateCodeMissingStatus);
        }

        /** Generate a new ED25519 key pair */
        const {privateKey, publicKey} = generateKeyPair();

        /** Save private key (handles existing/conflict cases) */
        const privateKeyResult = await PrivateKeyStore.set(accountID, privateKey, {nativePromptTitle});
        const privateKeyExists = privateKeyResult.reason === 'multifactorAuthentication.reason.expoErrors.keyExists';

        if (!privateKeyResult.value) {
            if (privateKeyExists && !status.value) {
                /**
                 * Handle edge case where private key exists but public key is missing.
                 * Remove private key to unblock authentication rather than trying recovery.
                 * This should never happen in the real app.
                 */
                await PrivateKeyStore.delete(accountID);
            }
            return setStatus(Status.createKeyErrorStatus(privateKeyResult));
        }

        /** Save public key */
        const publicKeyResult = await PublicKeyStore.set(accountID, publicKey);
        if (!publicKeyResult.value) {
            return setStatus(Status.createKeyErrorStatus(publicKeyResult));
        }

        /** Call backend to register the public key */
        const {
            step: {wasRecentStepSuccessful, isRequestFulfilled},
            reason,
        } = await processRegistration({
            publicKey,
            accountID,
            validateCode,
        });

        const successMessage = 'multifactorAuthentication.reason.success.keyPairGenerated';
        const isCallSuccessful = wasRecentStepSuccessful && isRequestFulfilled;

        /** Cleanup keys on failure to avoid partial state */
        if (!isCallSuccessful) {
            await resetKeys(accountID);
        }

        const builtStatus = {
            reason: isCallSuccessful ? successMessage : reason,
            type: privateKeyResult.type,
            step: {
                wasRecentStepSuccessful: isCallSuccessful,
                isRequestFulfilled: true,
                requiredFactorForNextStep: undefined,
            },
        };

        /** Persist and return the status */
        const statusResult = setStatus(Status.createRegistrationResultStatus(builtStatus));

        await refreshStatus();

        /** In chained flow, return the private key on success */
        if (chainedWithAuthorization && isCallSuccessful) {
            return {
                ...privateKeyResult,
                step: {
                    wasRecentStepSuccessful: true,
                    isRequestFulfilled: false,
                    requiredFactorForNextStep: CONST.MULTIFACTOR_AUTHENTICATION.FACTORS.SIGNED_CHALLENGE,
                },
                value: privateKey,
            };
        }

        return statusResult;
    }) as Register;

    return {
        ...status.step,
        ...status.value,
        deviceSupportBiometrics,
        message: status.message,
        title: status.title,
        register,
        revoke,
        cancel,
        refresh: refreshStatus,
    };
}

export default useNativeBiometricsSetup;

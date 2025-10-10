import {useCallback, useEffect, useMemo} from 'react';
import {BiometricsStatus} from '@hooks/useBiometricsStatus/types';
import {requestValidateCodeAction} from '@libs/actions/User';
import {BiometricsPrivateKeyStore, BiometricsPublicKeyStore} from '@libs/Biometrics/BiometricsKeyStore';
import processBiometricsScenario from '@libs/Biometrics/scenarios/processBiometricsScenario';
import {generateKeyPair} from '@libs/ED25519';
import CONST from '@src/CONST';
import useBiometricsStatus from '../useBiometricsStatus';
import {doesDeviceSupportBiometrics, isBiometryConfigured, resetKeys, Status} from './helpers';
import {Register, UseBiometricsSetup} from './types';

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
function useBiometricsSetup(): UseBiometricsSetup {
    /** Tracks whether biometrics is properly configured and ready for authentication */
    const [status, setStatus] = useBiometricsStatus<boolean>(false, CONST.BIOMETRICS.SCENARIO_TYPE.AUTHENTICATION);

    /**
     * Marks the current authentication request as complete.
     * Clears any pending requirements while preserving success/failure state.
     */
    const cancel = useCallback(() => setStatus(Status.createFulfillStatus), [setStatus]);

    /** Memoized check for device biometric capability */
    const deviceSupportBiometrics = useMemo(doesDeviceSupportBiometrics, []);

    /**
     * Updates the biometric configuration status by checking for stored public key.
     * Safe to call frequently as it doesn't trigger authentication prompts.
     */
    const refreshStatus = useCallback(async () => {
        const isConfigured = await isBiometryConfigured();
        return setStatus(Status.createRefreshStatusStatus(isConfigured));
    }, [setStatus]);

    /** Check initial biometric configuration on mount */
    useEffect(() => {
        refreshStatus();
    }, [refreshStatus]);

    /**
     * Resets biometric setup by removing stored keys and refreshing state.
     * Used when keys become invalid or during cleanup.
     */
    const revoke = useCallback(async () => {
        await resetKeys();
        return refreshStatus();
    }, [refreshStatus]);

    /**
     * Main registration flow for setting up biometric authentication.
     *
     * Flow:
     * 1. Validates device compatibility
     * 2. Ensures validation code is present
     * 3. Generates and stores keypair securely
     * 4. Registers public key with backend
     * 5. Updates local state based on results
     *
     * In chained authentication flows, returns private key on success for immediate use.
     *
     * Note: Will trigger system biometric prompt during key storage.
     */
    const register = useCallback(
        async ({validateCode, chainedWithAuthorization}) => {
            /** Guard unsupported device */
            if (!doesDeviceSupportBiometrics()) {
                return setStatus(Status.createUnsupportedDeviceStatus);
            }

            /** Guard missing validation code and request it */
            if (!validateCode) {
                requestValidateCodeAction();
                return setStatus(Status.createValidateCodeMissingStatus);
            }

            /** Generate a new ED25519 keypair */
            const {privateKey, publicKey} = generateKeyPair();

            /** Save private key (handles existing/conflict cases) */
            const privateKeyResult = await BiometricsPrivateKeyStore.set(privateKey);
            const privateKeyExists = privateKeyResult.reason === 'biometrics.reason.expoErrors.keyExists';

            if (!privateKeyResult.value) {
                if (privateKeyExists && !status.value) {
                    /**
                     * Handle edge case where private key exists but public key is missing.
                     * Remove private key to unblock authentication rather than trying recovery.
                     * This should never happen in the real app.
                     */
                    await BiometricsPrivateKeyStore.delete();
                }
                return setStatus(Status.createKeyErrorStatus(privateKeyResult));
            }

            /** Save public key */
            const publicKeyResult = await BiometricsPublicKeyStore.set(publicKey);
            if (!publicKeyResult.value) {
                return setStatus(Status.createKeyErrorStatus(publicKeyResult));
            }

            /** Call backend to register the public key */
            const {
                step: {wasRecentStepSuccessful, isRequestFulfilled},
                reason,
            } = await processBiometricsScenario(CONST.BIOMETRICS.SCENARIO.SETUP_BIOMETRICS, {
                publicKey,
                validateCode,
            });

            const successMessage = 'biometrics.reason.success.keyPairGenerated';
            const isCallSuccessful = wasRecentStepSuccessful && isRequestFulfilled;

            /** Cleanup keys on failure to avoid partial state */
            if (!isCallSuccessful) {
                await resetKeys();
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
                    value: privateKey,
                } as BiometricsStatus<string>;
            }

            return statusResult;
        },
        [setStatus, refreshStatus, status.value],
    ) as Register;

    /** Memoized state values exposed to consumers */
    const values = useMemo(() => {
        const {step, value: isBiometryConfigured, message, title} = status;

        return {
            ...step,
            deviceSupportBiometrics,
            isBiometryConfigured,
            message,
            title,
        };
    }, [deviceSupportBiometrics, status]);

    /** Memoized scenarios exposed to consumers */
    const scenarios = useMemo(
        () => ({
            register,
            revoke,
            cancel,
        }),
        [register, revoke, cancel],
    );

    return {
        ...values,
        ...scenarios,
    };
}

export default useBiometricsSetup;

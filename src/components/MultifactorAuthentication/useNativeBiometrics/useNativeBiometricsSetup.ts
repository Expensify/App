import {useCallback, useEffect} from 'react';
import {doesDeviceSupportBiometrics, isBiometryConfigured, resetKeys} from '@components/MultifactorAuthentication/helpers';
import type {BiometricsStatus, Register, UseBiometricsSetup} from '@components/MultifactorAuthentication/types';
import useMultifactorAuthenticationStatus from '@components/MultifactorAuthentication/useMultifactorAuthenticationStatus';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {generateKeyPair} from '@libs/MultifactorAuthentication/Biometrics/ED25519';
import {processRegistration} from '@libs/MultifactorAuthentication/Biometrics/helpers';
import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import {SECURE_STORE_VALUES} from '@libs/MultifactorAuthentication/Biometrics/SecureStore';
import type {MultifactorAuthenticationStatus} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';

/**
 * Hook that manages biometric setup state and operations.
 * Handles device capability detection, key pair generation, and registration with backend.
 * @returns Setup object with registration, cancellation, and refresh capabilities.
 */
function useNativeBiometricsSetup(): UseBiometricsSetup {
    const [status, setStatus] = useMultifactorAuthenticationStatus<BiometricsStatus>({
        isBiometryRegisteredLocally: false,
        isAnyDeviceRegistered: false,
        isLocalPublicKeyInAuth: false,
    });
    const {accountID} = useCurrentUserPersonalDetails();

    /**
     * Cancels the biometric setup process and marks it as fulfilled.
     * @param wasRecentStepSuccessful - Optional flag indicating if the step was successful before cancellation.
     * @returns Updated status reflecting the cancelled setup.
     */
    const cancel = (wasRecentStepSuccessful?: boolean) =>
        setStatus(
            (prevStatus) => ({
                ...prevStatus,
                step: {
                    isRequestFulfilled: true,
                    wasRecentStepSuccessful,
                    requiredFactorForNextStep: undefined,
                },
            }),
            CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.CANCEL,
        );

    const deviceSupportBiometrics = doesDeviceSupportBiometrics();

    /**
     * Refreshes the biometric setup status by checking backend and local configuration.
     * Queries the current biometric registration state and updates the status accordingly.
     * @param overwriteStatus - Optional partial status fields to overwrite in the status update.
     * @returns Updated authentication status with fresh biometric configuration.
     */
    const refreshStatus = useCallback(
        async (overwriteStatus?: Partial<MultifactorAuthenticationStatus<BiometricsStatus>>) => {
            const setupStatus = await isBiometryConfigured(accountID);

            const {isLocalPublicKeyInAuth, isAnyDeviceRegistered, isBiometryRegisteredLocally} = setupStatus;

            return setStatus(
                (prevStatus) => ({
                    ...prevStatus,
                    ...overwriteStatus,
                    value: {
                        isLocalPublicKeyInAuth,
                        isAnyDeviceRegistered,
                        isBiometryRegisteredLocally,
                    },
                }),
                CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.UPDATE,
            );
        },
        [accountID, setStatus],
    );

    useEffect(() => {
        refreshStatus();
    }, [refreshStatus]);

    /**
     * Registers biometric authentication for the current account.
     * Generates a key pair, stores it securely, and registers with the backend.
     * Supports both standalone registration and chained registration with authorization.
     * @param validateCode - One-time password for validation.
     * @param chainedWithAuthorization - Whether this registration is part of an authorization flow.
     * @param nativePromptTitle - Title to display in native biometric prompt.
     * @param scenario - Optional scenario name for the registration.
     * @param notificationPaths - Optional custom notification paths.
     * @param softPromptAccepted - Whether the user accepted a soft prompt.
     * @returns Registration result with key info or full authentication status.
     */
    const register = (async ({validateCode, chainedWithAuthorization, nativePromptTitle}, scenario) => {
        const statusReason = scenario ?? CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.REGISTER;

        if (!doesDeviceSupportBiometrics()) {
            return setStatus(
                (prevStatus) => ({
                    ...prevStatus,
                    value: {
                        isAnyDeviceRegistered: prevStatus.value.isAnyDeviceRegistered,
                        isLocalPublicKeyInAuth: false,
                        isBiometryRegisteredLocally: false,
                    },
                    step: {
                        wasRecentStepSuccessful: false,
                        isRequestFulfilled: true,
                        requiredFactorForNextStep: undefined,
                    },
                }),
                statusReason,
            );
        }

        if (!validateCode) {
            return setStatus(
                (prevStatus) => ({
                    ...prevStatus,
                    step: {
                        wasRecentStepSuccessful: false,
                        isRequestFulfilled: false,
                        requiredFactorForNextStep: CONST.MULTIFACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE,
                    },
                    reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.VALIDATE_CODE_MISSING,
                }),
                statusReason,
            );
        }

        const {privateKey, publicKey} = generateKeyPair();

        const privateKeyResult = await PrivateKeyStore.set(accountID, privateKey, {nativePromptTitle});
        const privateKeyExists = privateKeyResult.reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.EXPO.KEY_EXISTS;
        const marqetaAuthType = Object.values(SECURE_STORE_VALUES.AUTH_TYPE).find(({CODE}) => CODE === privateKeyResult.type)?.MQ_VALUE;

        if (!privateKeyResult.value || marqetaAuthType === undefined) {
            if (privateKeyExists && !status.value) {
                await PrivateKeyStore.delete(accountID);
            }
            return setStatus(
                (prevStatus) => ({
                    ...prevStatus,
                    reason: privateKeyResult.reason,
                    type: privateKeyResult.type,
                    step: {
                        wasRecentStepSuccessful: false,
                        isRequestFulfilled: true,
                        requiredFactorForNextStep: undefined,
                    },
                }),
                statusReason,
            );
        }

        const publicKeyResult = await PublicKeyStore.set(accountID, publicKey);

        if (!publicKeyResult.value) {
            await PrivateKeyStore.delete(accountID);
            return setStatus(
                (prevStatus) => ({
                    ...prevStatus,
                    reason: publicKeyResult.reason,
                    type: publicKeyResult.type,
                    step: {
                        wasRecentStepSuccessful: false,
                        isRequestFulfilled: true,
                        requiredFactorForNextStep: undefined,
                    },
                }),
                statusReason,
            );
        }

        const {
            step: {wasRecentStepSuccessful, isRequestFulfilled},
            reason,
        } = await processRegistration({
            publicKey,
            validateCode,
            authenticationMethod: marqetaAuthType,
        });

        const successMessage = CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.KEY_PAIR_GENERATED;
        const isCallSuccessful = wasRecentStepSuccessful && isRequestFulfilled;

        if (!isCallSuccessful) {
            await resetKeys(accountID);
        }

        const statusResult = setStatus(
            (prevStatus) => ({
                ...prevStatus,
                reason: isCallSuccessful ? successMessage : reason,
                type: privateKeyResult.type,
                step: {
                    wasRecentStepSuccessful: isCallSuccessful,
                    isRequestFulfilled: true,
                    requiredFactorForNextStep: undefined,
                },
            }),
            statusReason,
        );

        await refreshStatus();

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
        headerTitle: status.headerTitle,
        description: status.description,
        title: status.title,
        register,
        cancel,
        refresh: refreshStatus,
    };
}

export default useNativeBiometricsSetup;

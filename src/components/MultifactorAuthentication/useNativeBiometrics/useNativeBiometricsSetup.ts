import {useEffect} from 'react';
import {doesDeviceSupportBiometrics, isBiometryConfigured, resetKeys, Status} from '@components/MultifactorAuthentication/helpers';
import type {BiometricsStatus, Register, UseBiometricsSetup} from '@components/MultifactorAuthentication/types';
import useMultifactorAuthenticationStatus from '@components/MultifactorAuthentication/useMultifactorAuthenticationStatus';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {generateKeyPair} from '@libs/MultifactorAuthentication/Biometrics/ED25519';
import {processRegistration} from '@libs/MultifactorAuthentication/Biometrics/helpers';
import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import type {MultifactorAuthenticationStatus} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';

function useNativeBiometricsSetup(): UseBiometricsSetup {
    const [status, setStatus] = useMultifactorAuthenticationStatus<BiometricsStatus>({
        isBiometryRegisteredLocally: false,
        isAnyDeviceRegistered: false,
        isLocalPublicKeyInAuth: false,
    });
    const {accountID} = useCurrentUserPersonalDetails();

    const cancel = (wasRecentStepSuccessful?: boolean) =>
        setStatus(Status.createCancelStatus(wasRecentStepSuccessful), CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.CANCEL);

    const deviceSupportBiometrics = doesDeviceSupportBiometrics();

    const refreshStatus = async (overwriteStatus?: Partial<MultifactorAuthenticationStatus<BiometricsStatus>>) => {
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
            CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.UPDATE,
        );
    };

    useEffect(() => {
        refreshStatus();
    }, [refreshStatus]);

    const register = (async ({validateCode, chainedWithAuthorization, nativePromptTitle}, scenario) => {
        const statusReason = scenario ?? CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.REGISTER;

        if (!doesDeviceSupportBiometrics()) {
            return setStatus(Status.createUnsupportedDeviceStatus, statusReason);
        }

        if (!validateCode) {
            return setStatus(Status.createValidateCodeMissingStatus, statusReason);
        }

        const {privateKey, publicKey} = generateKeyPair();

        const privateKeyResult = await PrivateKeyStore.set(accountID, privateKey, {nativePromptTitle});
        const privateKeyExists = privateKeyResult.reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.EXPO.KEY_EXISTS;

        if (!privateKeyResult.value) {
            if (privateKeyExists && !status.value) {
                await PrivateKeyStore.delete(accountID);
            }
            return setStatus(Status.createKeyErrorStatus(privateKeyResult), statusReason);
        }

        const publicKeyResult = await PublicKeyStore.set(accountID, publicKey);
        if (!publicKeyResult.value) {
            return setStatus(Status.createKeyErrorStatus(publicKeyResult), statusReason);
        }

        const {
            step: {wasRecentStepSuccessful, isRequestFulfilled},
            reason,
        } = await processRegistration({
            publicKey,
            accountID,
            validateCode,
        });

        const successMessage = CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.KEY_PAIR_GENERATED;
        const isCallSuccessful = wasRecentStepSuccessful && isRequestFulfilled;

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

        const statusResult = setStatus(Status.createRegistrationResultStatus(builtStatus), statusReason);

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

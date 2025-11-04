import {useCallback} from 'react';
import {createAuthorizeErrorStatus} from '@hooks/MultifactorAuthentication/helpers';
import type {MultifactorAuthorization} from '@hooks/MultifactorAuthentication/types';
import useMultifactorAuthenticationStatus from '@hooks/MultifactorAuthentication/useMultifactorAuthenticationStatus';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import Challenge from '@libs/MultifactorAuthentication/Biometrics/Challenge';
import type {MultifactorAuthenticationScenario} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';
import useNativeBiometricsSetup from './useNativeBiometricsSetup';

/**
 * Hook that manages multifactorial authentication authorization for transactions.
 *
 * Handles the complete authorization flow including:
 * - Requesting a challenge from the server
 * - Signing the challenge with multifactorial authentication
 * - Verifying the signature with the server
 *
 * Returns current authorization status and methods to control the flow.
 */
function useNativeBiometrics() {
    const [status, setStatus] = useMultifactorAuthenticationStatus(false, CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION);
    const BiometricsSetup = useNativeBiometricsSetup();
    const {accountID} = useCurrentUserPersonalDetails();

    /**
     * Requests, signs and verifies a multifactorial authentication challenge for transaction authorization.
     *
     * Can accept a validate code for devices without multifactorial authentication or during re-registration.
     * Can accept a previously obtained private key status to avoid duplicate auth prompts.
     *
     * Will trigger a multifactorial authentication prompt if no private key status is provided.
     */
    const authorize = useCallback(
        async <T extends MultifactorAuthenticationScenario>(scenario: T, params: Parameters<MultifactorAuthorization<T>>[1]): ReturnType<MultifactorAuthorization<T>> => {
            const {chainedPrivateKeyStatus} = params;
            const challenge = new Challenge(scenario, params);

            const requestStatus = await challenge.request(accountID);
            if (!requestStatus.value) {
                return setStatus(createAuthorizeErrorStatus(requestStatus));
            }

            const signature = await challenge.sign(accountID, chainedPrivateKeyStatus);
            if (!signature.value) {
                return setStatus(createAuthorizeErrorStatus(signature));
            }

            const result = await challenge.send();

            return setStatus({
                ...result,
                step: {
                    wasRecentStepSuccessful: result.value,
                    isRequestFulfilled: true,
                    requiredFactorForNextStep: undefined,
                },
            });
        },
        [accountID, setStatus],
    );

    /**
     * Marks the current authorization request as complete.
     * Preserves the success/failure state while clearing any pending requirements.
     */
    const cancel = useCallback(() => {
        return setStatus((prevStatus) => ({
            ...prevStatus,
            step: {
                isRequestFulfilled: true,
                requiredFactorForNextStep: undefined,
                wasRecentStepSuccessful: undefined,
            },
        }));
    }, [setStatus]);

    return {status, authorize, cancel, setup: BiometricsSetup};
}

export default useNativeBiometrics;

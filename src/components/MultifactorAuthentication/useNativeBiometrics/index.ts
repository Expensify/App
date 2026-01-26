import {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from '@components/MultifactorAuthentication/config';
import type {MultifactorAuthenticationScenario} from '@components/MultifactorAuthentication/config/types';
import {createAuthorizeErrorStatus} from '@components/MultifactorAuthentication/helpers';
import type {MultifactorAuthorization} from '@components/MultifactorAuthentication/types';
import useMultifactorAuthenticationStatus from '@components/MultifactorAuthentication/useMultifactorAuthenticationStatus';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import MultifactorAuthenticationChallenge from '@libs/MultifactorAuthentication/Biometrics/Challenge';
import CONST from '@src/CONST';
import useNativeBiometricsSetup from './useNativeBiometricsSetup';

/**
 * Hook that manages native biometric authentication flow.
 * Provides authorization capabilities and setup management for biometric-based multifactor authentication.
 * Handles challenge generation, signing, and authorization verification.
 * @returns Object containing authorization status, authorize function, cancel function, and setup utilities.
 */
function useNativeBiometrics() {
    const [status, setStatus] = useMultifactorAuthenticationStatus(false);
    const BiometricsSetup = useNativeBiometricsSetup();
    const {accountID} = useCurrentUserPersonalDetails();
    const {translate} = useLocalize();

    /**
     * Authorizes the user using biometric authentication for the specified scenario.
     * Generates a challenge, signs it with the user's private key, and sends it to the backend.
     * @param scenario - The authentication scenario to authorize for.
     * @param params - Parameters including optional chained private key status.
     * @returns Authentication status with success/failure indication.
     */
    const authorize = async <T extends MultifactorAuthenticationScenario>(scenario: T, params: Parameters<MultifactorAuthorization<T>>[1]): ReturnType<MultifactorAuthorization<T>> => {
        const {chainedPrivateKeyStatus} = params;

        const {nativePromptTitle: nativePromptTitleTPath} = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario];

        const nativePromptTitle = translate(nativePromptTitleTPath);

        const challenge = new MultifactorAuthenticationChallenge(scenario, params, {
            nativePromptTitle,
        });

        const requestStatus = await challenge.request();
        if (!requestStatus.value) {
            return setStatus(createAuthorizeErrorStatus(requestStatus), scenario);
        }

        const signature = await challenge.sign(accountID, chainedPrivateKeyStatus);
        if (!signature.value) {
            return setStatus(createAuthorizeErrorStatus(signature), scenario);
        }

        const result = await challenge.send();

        return setStatus(
            {
                ...result,
                step: {
                    wasRecentStepSuccessful: result.value,
                    isRequestFulfilled: true,
                    requiredFactorForNextStep: undefined,
                },
            },
            scenario,
        );
    };

    /**
     * Cancels the current biometric authorization flow.
     * Marks the request as fulfilled and records the completion status.
     * @param wasRecentStepSuccessful - Optional flag indicating the result before cancellation.
     * @returns Updated authentication status with cancelled state.
     */
    const cancel = (wasRecentStepSuccessful?: boolean) => {
        return setStatus(
            (prevStatus) => ({
                ...prevStatus,
                step: {
                    isRequestFulfilled: true,
                    requiredFactorForNextStep: undefined,
                    wasRecentStepSuccessful,
                },
            }),
            CONST.MULTIFACTOR_AUTHENTICATION.NO_SCENARIO_FOR_STATUS_REASON.CANCEL,
        );
    };

    return {status, authorize, cancel, setup: BiometricsSetup};
}

export default useNativeBiometrics;

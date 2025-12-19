import {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from '@components/MultifactorAuthentication/config';
import type {MultifactorAuthenticationScenario} from '@components/MultifactorAuthentication/config/types';
import {createAuthorizeErrorStatus} from '@components/MultifactorAuthentication/helpers';
import type {MultifactorAuthorization} from '@components/MultifactorAuthentication/types';
import useMultifactorAuthenticationStatus from '@components/MultifactorAuthentication/useMultifactorAuthenticationStatus';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import MultifactorAuthenticationChallenge from '@libs/MultifactorAuthentication/Biometrics/Challenge';
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
    const [status, setStatus] = useMultifactorAuthenticationStatus(false);
    const BiometricsSetup = useNativeBiometricsSetup();
    const {accountID} = useCurrentUserPersonalDetails();
    const {translate} = useLocalize();

    /**
     * Requests, signs and verifies a multifactorial authentication challenge for transaction authorization.
     *
     * Can accept a validate code for devices without multifactorial authentication or during re-registration.
     * Can accept a previously obtained private key status to avoid duplicate auth prompts.
     *
     * Will trigger a multifactorial authentication prompt if no private key status is provided.
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
    };

    /**
     * Marks the current authorization request as complete.
     * Preserves the success/failure state while clearing any pending requirements.
     */
    const cancel = (wasRecentStepSuccessful?: boolean) => {
        return setStatus((prevStatus) => ({
            ...prevStatus,
            step: {
                isRequestFulfilled: true,
                requiredFactorForNextStep: undefined,
                wasRecentStepSuccessful,
            },
        }));
    };

    return {status, authorize, cancel, setup: BiometricsSetup};
}

export default useNativeBiometrics;

import {useCallback} from 'react';
import BiometricsChallenge from '@libs/Biometrics/BiometricsChallenge';
import CONST from '@src/CONST';
import useBiometricsStatus from '../useBiometricsStatus';
import {createAuthorizeErrorStatus} from './helpers';
import {BiometricsAuthorization} from './types';

/**
 * Hook that manages biometric authorization for transactions.
 *
 * Handles the complete authorization flow including:
 * - Requesting a challenge from the server
 * - Signing the challenge with biometric authentication
 * - Verifying the signature with the server
 *
 * Returns current authorization status and methods to control the flow.
 */
function useBiometricsAuthorization() {
    const [status, setStatus] = useBiometricsStatus(false, CONST.BIOMETRICS.SCENARIO_TYPE.AUTHORIZATION);

    /**
     * Requests, signs and verifies a biometric challenge for transaction authorization.
     *
     * Can accept a validate code for devices without biometrics or during re-registration.
     * Can accept a previously obtained private key status to avoid duplicate auth prompts.
     *
     * Will trigger a biometric authentication prompt if no private key status is provided.
     */
    const authorize: BiometricsAuthorization = useCallback(
        async ({transactionID, validateCode, chainedPrivateKeyStatus}) => {
            const challenge = new BiometricsChallenge(transactionID);

            const requestStatus = await challenge.request();
            if (!requestStatus.value) setStatus(createAuthorizeErrorStatus(requestStatus));

            const signature = await challenge.sign(chainedPrivateKeyStatus);
            if (!signature.value) setStatus(createAuthorizeErrorStatus(signature));

            const result = await challenge.send(validateCode);

            return setStatus({
                ...result,
                step: {
                    wasRecentStepSuccessful: result.value,
                    isRequestFulfilled: true,
                    requiredFactorForNextStep: undefined,
                },
            });
        },
        [setStatus],
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
                wasRecentStepSuccessful: !prevStatus.step.requiredFactorForNextStep && prevStatus.step.wasRecentStepSuccessful,
            },
        }));
    }, [setStatus]);

    return {status, authorize, cancel};
}

export default useBiometricsAuthorization;

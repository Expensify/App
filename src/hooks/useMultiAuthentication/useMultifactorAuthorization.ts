import {useCallback} from 'react';
import Challenge from '@libs/MultifactorAuthentication/Challenge';
import CONST from '@src/CONST';
import {createAuthorizeErrorStatus} from './helpers';
import type {MultifactorAuthorization, UseMultifactorAuthorization} from './types';
import useMultifactorAuthenticationStatus from './useMultifactorAuthenticationStatus';

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
function useMultifactorAuthorization(): UseMultifactorAuthorization {
    const [status, setStatus] = useMultifactorAuthenticationStatus(false, CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION);

    /**
     * Requests, signs and verifies a multifactorial authentication challenge for transaction authorization.
     *
     * Can accept a validate code for devices without multifactorial authentication or during re-registration.
     * Can accept a previously obtained private key status to avoid duplicate auth prompts.
     *
     * Will trigger a multifactorial authentication prompt if no private key status is provided.
     */
    const authorize: MultifactorAuthorization = useCallback(
        async ({transactionID, chainedPrivateKeyStatus}) => {
            const challenge = new Challenge(transactionID);

            const requestStatus = await challenge.request();
            if (!requestStatus.value) {
                setStatus(createAuthorizeErrorStatus(requestStatus));
            }

            const signature = await challenge.sign(chainedPrivateKeyStatus);
            if (!signature.value) {
                setStatus(createAuthorizeErrorStatus(signature));
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

export default useMultifactorAuthorization;

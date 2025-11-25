import {useCallback, useMemo} from 'react';
import useOnyx from '@hooks/useOnyx';
import {areFactorsSufficient, processScenario} from '@libs/MultifactorAuthentication/Biometrics/helpers';
import type {MultifactorAuthenticationScenario} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {Status} from './helpers';
import type {AuthorizeUsingFallback} from './types';
import useMultifactorAuthenticationStatus from './useMultifactorAuthenticationStatus';

/**
 * Hook that provides fallback authorization flow when multifactorial authentication is not available.
 * Uses validate code and OTP for transaction authorization instead.
 */
function useMultifactorAuthorizationFallback() {
    const [status, setStatus] = useMultifactorAuthenticationStatus<number | undefined>(undefined, CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO_TYPE.AUTHORIZATION_FALLBACK);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const is2FAEnabled = !!account?.requiresTwoFactorAuth && false;

    /**
     * Authorizes a transaction using OTP and validate code when multifactorial authentication is unavailable.
     * Handles the multistep verification process, requesting additional factors when needed.
     * Updates status to reflect the current state of authorization and any required next steps.
     */
    const authorize = useCallback(
        async <T extends MultifactorAuthenticationScenario>(scenario: T, params: Parameters<AuthorizeUsingFallback<T>>[1]): ReturnType<AuthorizeUsingFallback<T>> => {
            const valueToStore = CONST.MULTIFACTOR_AUTHENTICATION.FACTORS.VALIDATE_CODE;
            const parameterName = CONST.MULTIFACTOR_AUTHENTICATION.FACTORS_REQUIREMENTS[valueToStore].parameter;
            const storedValue = params[parameterName];
            const providedOrStoredFactor = storedValue ?? status.value;

            const paramsWithStoredValue = {
                ...params,
                ...(parameterName ? {[parameterName]: providedOrStoredFactor} : {}),
            };

            const {reason: factorsCheckReason, step: factorsCheckStep} = areFactorsSufficient(
                paramsWithStoredValue,
                CONST.MULTIFACTOR_AUTHENTICATION.FACTOR_COMBINATIONS.FALLBACK,
                !!status.value,
                is2FAEnabled,
            );

            if (factorsCheckStep.requiredFactorForNextStep) {
                return setStatus((prevStatus) => ({
                    ...prevStatus,
                    step: factorsCheckStep,
                    reason: factorsCheckReason,
                    value: factorsCheckStep.requiredFactorForNextStep === CONST.MULTIFACTOR_AUTHENTICATION.FACTORS.OTP && is2FAEnabled ? storedValue : undefined,
                }));
            }

            const processResult = await processScenario(scenario, paramsWithStoredValue, CONST.MULTIFACTOR_AUTHENTICATION.FACTOR_COMBINATIONS.FALLBACK, !!status.value);

            const isWaitingForOTP = processResult.step.requiredFactorForNextStep && processResult.step.wasRecentStepSuccessful;

            return setStatus({...processResult, ...(isWaitingForOTP ? {value: storedValue} : {})});
        },
        [status.value, setStatus, is2FAEnabled],
    );

    /**
     * Marks the current authorization request as fulfilled and resets the validate code.
     * Used when completing or canceling an authorization flow.
     */
    const cancel = useCallback(
        (wasRecentStepSuccessful?: boolean) => {
            return setStatus(Status.createCancelStatusWithNoValue(wasRecentStepSuccessful));
        },
        [setStatus],
    );

    return useMemo(
        () => ({
            ...status.step,
            message: status.message,
            title: status.title,
            authorize,
            cancel,
        }),
        [authorize, cancel, status.message, status.step, status.title],
    );
}

export default useMultifactorAuthorizationFallback;

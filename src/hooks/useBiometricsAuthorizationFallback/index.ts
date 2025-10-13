import {useCallback, useMemo} from 'react';
import {biometricsScenarios} from '@libs/Biometrics/scenarios';
import processBiometricsScenario, {areBiometricsFactorsSufficient} from '@libs/Biometrics/scenarios/processBiometricsScenario';
import type {
    BiometricsFallbackFactor,
    BiometricsFallbackFactors,
    BiometricsFallbackScenario,
    BiometricsFallbackScenarioParams,
    BiometricsScenarioStoredValueType,
} from '@libs/Biometrics/scenarios/types';
import CONST from '@src/CONST';
import useBiometricsStatus from '@hooks/useBiometricsStatus';
import {convertBiometricsFactorToParameterName} from './helpers';
import type {AuthorizeUsingFallback, UseBiometricsAuthorizationFallback} from './types';

/**
 * Hook that provides fallback authorization flow when biometrics is not available.
 * Uses validate code and OTP for transaction authorization instead.
 */
function useBiometricsAuthorizationFallback<T extends BiometricsFallbackScenario>(scenario: T): UseBiometricsAuthorizationFallback<T> {
    const [status, setStatus] = useBiometricsStatus<BiometricsScenarioStoredValueType<T> | undefined>(undefined, CONST.BIOMETRICS.SCENARIO_TYPE.AUTHORIZATION);

    /**
     * Verifies that all required authentication factors are provided.
     * Checks both OTP and validate code against the requirements for non-biometric devices.
     */
    const verifyFactors = useCallback(
        (params: BiometricsFallbackScenarioParams<T>) =>
            areBiometricsFactorsSufficient(scenario, {
                ...params,
                isStoredFactorVerified: !!status.value,
            }),
        [scenario, status.value],
    );

    /**
     * Authorizes a transaction using OTP and validate code when biometrics is unavailable.
     * Handles the multistep verification process, requesting additional factors when needed.
     * Updates status to reflect the current state of authorization and any required next steps.
     */
    const authorize: AuthorizeUsingFallback<T> = useCallback(
        async (params) => {
            const valueToStore = 'factorToStore' in biometricsScenarios[scenario] && biometricsScenarios[scenario].factorToStore;

            const parameterName =
                valueToStore &&
                CONST.BIOMETRICS.FACTORS_REQUIREMENTS[valueToStore].origin === CONST.BIOMETRICS.FACTORS_ORIGIN.FALLBACK &&
                (convertBiometricsFactorToParameterName(valueToStore as BiometricsFallbackFactor));

            const storedValue = parameterName && (params[parameterName] as BiometricsScenarioStoredValueType<T>);

            const providedOrStoredFactor = storedValue || status.value;
            const {reason: factorsCheckReason, step: factorsCheckStep} = verifyFactors({
                ...params,
                ...(parameterName ? {[parameterName]: providedOrStoredFactor} : {}),
            });

            if (factorsCheckStep.requiredFactorForNextStep) {
                if ('missingFactorMiddleware' in biometricsScenarios[scenario]) {
                    await biometricsScenarios[scenario].missingFactorMiddleware?.(factorsCheckStep.requiredFactorForNextStep);
                }

                return setStatus((prevStatus) => ({
                    ...prevStatus,
                    step: factorsCheckStep,
                    reason: factorsCheckReason,
                }));
            }

            const processResult = await processBiometricsScenario(scenario, {
                ...params,
                ...(parameterName ? {[parameterName]: providedOrStoredFactor} : {}),
                isStoredFactorVerified: !!status.value,
            });

            const {step} = processResult;

            if (step.requiredFactorForNextStep && step.wasRecentStepSuccessful) {
                return setStatus({
                    ...processResult,
                    value: storedValue || undefined,
                });
            }
                return setStatus(processResult);

        },
        [status.value, verifyFactors, scenario, setStatus],
    );

    /**
     * Marks the current authorization request as fulfilled and resets the validate code.
     * Used when completing or canceling an authorization flow.
     */
    const cancel = useCallback(
        () =>
            setStatus((prevStatus) => ({
                ...prevStatus,
                value: undefined,
                step: {
                    isRequestFulfilled: true,
                    requiredFactorForNextStep: undefined,
                    wasRecentStepSuccessful: !prevStatus.step.requiredFactorForNextStep && prevStatus.step.wasRecentStepSuccessful,
                },
            })),
        [setStatus],
    );

    /** Memoized state values exposed to consumers */
    const values = useMemo(() => {
        const {step, message, title} = status;
        return {...step, message, title};
    }, [status]);

    /** Memoized scenarios exposed to consumers */
    const scenarios = useMemo(() => ({authorize, cancel}), [authorize, cancel]);

    return {...values, ...scenarios};
}

export default useBiometricsAuthorizationFallback;

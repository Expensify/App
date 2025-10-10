import {useCallback, useMemo} from 'react';
import {requestValidateCodeAction} from '@libs/actions/User';
import {biometricsScenarioRequiredFactors, biometricsScenarios} from '@libs/Biometrics/scenarios';
import processBiometricsScenario from '@libs/Biometrics/scenarios/processBiometricsScenario';
import {
    BiometricsFallbackFactor,
    BiometricsFallbackFactors,
    BiometricsFallbackScenario,
    BiometricsFallbackScenarioParams,
    BiometricsScenarioStoredValueType,
} from '@libs/Biometrics/scenarios/types';
import CONST from '@src/CONST';
import useBiometricsStatus from '../useBiometricsStatus';
import {convertBiometricsFactorToParameterName, verifyRequiredFactors} from './helpers';
import {AuthorizeUsingFallback, UseBiometricsAuthorizationFallback} from './types';

/**
 * Hook that provides fallback authorization flow when biometrics is not available.
 * Uses validate code and OTP for transaction authorization instead.
 */
function useBiometricsAuthorizationFallback<T extends BiometricsFallbackScenario>(scenario: T): UseBiometricsAuthorizationFallback<T> {
    const [status, setStatus] = useBiometricsStatus<BiometricsScenarioStoredValueType<T> | undefined>(undefined, CONST.BIOMETRICS.SCENARIO_TYPE.AUTHORIZATION);

    const requiredFactors = biometricsScenarioRequiredFactors[scenario];

    /**
     * Verifies that all required authentication factors are provided.
     * Checks both OTP and validate code against the requirements for non-biometric devices.
     */
    const verifyFactors = useCallback(
        (params: BiometricsFallbackScenarioParams<T>) =>
            verifyRequiredFactors({
                ...params,
                requiredFactors,
                isFirstFactorVerified: !!status.value,
            }),
        [requiredFactors, status.value],
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
                (convertBiometricsFactorToParameterName(valueToStore as BiometricsFallbackFactor) as keyof BiometricsFallbackFactors<T>);

            const storedValue = parameterName && (params[parameterName] as BiometricsScenarioStoredValueType<T>);

            const providedOrStoredFactor = storedValue || status.value;
            const {value: factorsCheckValue, reason: factorsCheckReason} = verifyFactors({
                ...params,
                ...(parameterName ? {[parameterName]: providedOrStoredFactor} : {}),
            });

            if (factorsCheckValue !== true) {
                if ('missingFactorMiddleware' in biometricsScenarios[scenario]) {
                    await biometricsScenarios[scenario].missingFactorMiddleware?.(factorsCheckValue);
                }

                return setStatus((prevStatus) => ({
                    ...prevStatus,
                    step: {
                        requiredFactorForNextStep: factorsCheckValue,
                        wasRecentStepSuccessful: false,
                        isRequestFulfilled: false,
                    },
                    reason: factorsCheckReason,
                }));
            }

            return setStatus(
                await processBiometricsScenario(scenario, {
                    ...params,
                    ...(parameterName ? {[parameterName]: providedOrStoredFactor} : {}),
                    isStoredFactorVerified: !!status.value,
                }),
            );
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

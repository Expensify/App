import {convertBiometricsParameterNameToFactor} from '@hooks/useBiometricsAuthorizationFallback/helpers';
import type {BiometricsPartialStatus} from '@hooks/useBiometricsStatus/types';
import CONST from '@src/CONST';
import {biometricsScenarioRequiredFactors, biometricsScenarios} from ".";
import type {
    BiometricsFactor,
    BiometricsFactors,
    BiometricsScenario,
    BiometricsScenarioMap,
    BiometricsScenarioParams,
    BiometricsScenarioResponseWithSuccess,
    BiometricsScenarioStoredValueType,
} from './types';

/**
 * Validates that all required authentication factors are present and of the correct type/format.
 * Checks each factor's presence, type, and length requirements.
 * Skips OTP validation if the validation code hasn't been verified yet.
 */
function areBiometricsFactorsSufficient<T extends BiometricsScenario>(scenario: T, factors: BiometricsScenarioParams<T, true>): BiometricsPartialStatus<true | string> {
    const requiredFactors = biometricsScenarioRequiredFactors[scenario].map((id) => CONST.BIOMETRICS.FACTORS_REQUIREMENTS[id]);

    const {isStoredFactorVerified = true} = factors;

    for (const {id, parameter, name, type, length} of requiredFactors) {
        if ('factorToStore' in biometricsScenarios[scenario] && id !== biometricsScenarios[scenario].factorToStore && !isStoredFactorVerified) {
            continue;
        }

        const unsuccessfulStep = {
            requiredFactorForNextStep: id,
            wasRecentStepSuccessful: false,
            isRequestFulfilled: false,
        };

        if (!(parameter in factors)) {
            return {
                value: `Missing required factor: ${name} (${parameter})`,
                step: unsuccessfulStep,
                reason: 'biometrics.reason.generic.authFactorsError',
            };
        }

        const value = factors[parameter as keyof BiometricsFactors<T>];

        if (typeof value !== typeof type) {
            return {
                value: `Invalid type for factor: ${name} (${parameter}). Expected ${typeof type}, got ${typeof value}`,
                step: unsuccessfulStep,
                reason: 'biometrics.reason.generic.authFactorsError',
            };
        }

        if (typeof length === 'number' && String(value).length !== length) {
            return {
                value: `Invalid length for factor: ${name} (${parameter}). Expected length ${length}, got length ${String(value).length}`,
                step: unsuccessfulStep,
                reason: 'biometrics.reason.generic.authFactorsError',
            };
        }
    }

    return {
        value: true,
        step: {
            requiredFactorForNextStep: undefined,
            wasRecentStepSuccessful: undefined,
            isRequestFulfilled: false,
        },
        reason: 'biometrics.reason.generic.authFactorsSufficient',
    };
}

const authorizeBiometricsPostMethodFallback = <T extends BiometricsScenario>(
    status: BiometricsPartialStatus<BiometricsScenarioResponseWithSuccess, true>,
    params: BiometricsScenarioParams<T, true>,
    scenario?: T,
) => {
    const providedParams = Object.entries(params).reduce(
        (paramsDict, paramEntry) => {
            const [key, value] = paramEntry as [keyof BiometricsFactors<T>, unknown];
            if (key === 'isStoredFactorVerified') {
                return paramsDict;
            }
            const convertedKey = convertBiometricsParameterNameToFactor(key);
            paramsDict[convertedKey] = !!value;
            return paramsDict;
        },
        {} as Partial<Record<BiometricsFactor, boolean>>,
    );

    const missingRequiredFactor = scenario && biometricsScenarioRequiredFactors[scenario].find((factor) => !Object.keys(providedParams).includes(factor));

    const emptyProvidedFactor = Object.entries(providedParams)
        .find(([_, value]) => !value)
        ?.at(0) as BiometricsFactor | undefined;

    return {
        ...status,
        step: {
            requiredFactorForNextStep: status.value.httpCode === CONST.BIOMETRICS.NEED_SECOND_FACTOR_HTTP_CODE ? emptyProvidedFactor || missingRequiredFactor : undefined,
            wasRecentStepSuccessful: status.value.successful,
            isRequestFulfilled: !!status.value.httpCode && status.value.httpCode !== CONST.BIOMETRICS.NEED_SECOND_FACTOR_HTTP_CODE,
        },
        value: undefined,
    };
};

/**
 * Main authorization function that handles different biometric scenarios.
 * First validates that all required factors are present and valid.
 * Then sends the authorization request to the server.
 * Finally, post-processes the result based on the scenario type.
 * Returns a status object containing the authorization result and any additional information needed.
 */
async function processBiometricsScenario<T extends BiometricsScenario>(
    scenario: T,
    params: BiometricsScenarioParams<T, true>,
): Promise<BiometricsPartialStatus<BiometricsScenarioStoredValueType<T> | undefined>> {
    const {scenarioMethod, postScenarioMethod} = biometricsScenarios[scenario] as BiometricsScenarioMap[T];

    /**
     * Selects the appropriate post-processing method based on the scenario type.
     * Uses the fallback method if no post-processing method is defined.
     */
    const postMethod = (status: BiometricsPartialStatus<BiometricsScenarioResponseWithSuccess, true>) =>
        (postScenarioMethod ?? authorizeBiometricsPostMethodFallback<T>)(status, params, scenario);

    const factorsCheckResult = areBiometricsFactorsSufficient(scenario, params);

    if (factorsCheckResult.value !== true) {
        return postMethod({
            ...factorsCheckResult,
            value: {httpCode: undefined, successful: false},
        });
    }

    const {httpCode, reason} = await scenarioMethod(params);

    return postMethod({
        value: {
            successful: String(httpCode).startsWith('2'),
            httpCode,
        },
        reason,
    });
}

export default processBiometricsScenario;
export {areBiometricsFactorsSufficient};

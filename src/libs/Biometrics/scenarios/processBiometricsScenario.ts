import {BiometricsPartialStatus} from '@hooks/useBiometricsStatus/types';
import {biometricsScenarioRequiredFactors, biometricsScenarios} from '@libs/Biometrics/scenarios';
import {
    BiometricsFactors,
    BiometricsScenario,
    BiometricsScenarioMap,
    BiometricsScenarioParams,
    BiometricsScenarioResponseWithSuccess,
    BiometricsScenarioStoredValueType,
} from '@libs/Biometrics/scenarios/types';
import CONST from '@src/CONST';

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

const authorizeBiometricsPostMethodFallback = (status: BiometricsPartialStatus<BiometricsScenarioResponseWithSuccess, true>) => ({
    ...status,
    step: {
        requiredFactorForNextStep: undefined,
        wasRecentStepSuccessful: status.value.successful,
        isRequestFulfilled: !!status.value.httpCode,
    },
    value: undefined,
});

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
    const postMethod = (status: BiometricsPartialStatus<BiometricsScenarioResponseWithSuccess, true>) => (postScenarioMethod ?? authorizeBiometricsPostMethodFallback)(status, params);

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

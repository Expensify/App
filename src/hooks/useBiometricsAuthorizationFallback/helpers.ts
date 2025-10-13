import {biometricsScenarioRequiredFactors} from '@/src/libs/Biometrics/scenarios';
import {
    BiometricsFactor,
    BiometricsFactors,
    BiometricsFallbackFactor,
    BiometricsFallbackFactors,
    BiometricsFallbackScenario,
    BiometricsFallbackScenarioParams,
    BiometricsScenario,
} from '@libs/Biometrics/scenarios/types';
import CONST from '@src/CONST';

/**
 * Takes a biometrics factor (like OTP or validate code) and converts it to the corresponding
 * parameter name that will be used in the fallback authentication flow. For example,
 * converts the factor "VALIDATE_CODE" to the parameter name "validateCode".
 */
function convertBiometricsFactorToParameterName<T extends BiometricsFallbackScenario>(factor: BiometricsFallbackFactor) {
    return CONST.BIOMETRICS.FACTORS_REQUIREMENTS[factor].parameter as keyof BiometricsFallbackFactors<T>;
}

/**
 * Takes a biometrics parameter name (like OTP or validate code) and converts it to the corresponding
 * factor that will be used in the fallback authentication flow. For example,
 * converts the parameter name "validateCode" to the factor "VALIDATE_CODE".
 */
function convertBiometricsParameterNameToFactor<T extends BiometricsScenario>(parameter: keyof BiometricsFactors<T>) {
    return Object.values(CONST.BIOMETRICS.FACTORS_REQUIREMENTS).find((factor) => factor.parameter === parameter)?.id as BiometricsFactor;
}

function areBiometricsFallbackParamsValid<T extends BiometricsFallbackScenario>(scenario: T, params: Record<string, unknown>): params is BiometricsFallbackScenarioParams<T> {
    return Object.keys(params).every((key) => {
        return biometricsScenarioRequiredFactors[scenario].find((factor) => CONST.BIOMETRICS.FACTORS_REQUIREMENTS[factor].parameter === key);
    });
}

export {convertBiometricsFactorToParameterName, areBiometricsFallbackParamsValid, convertBiometricsParameterNameToFactor};

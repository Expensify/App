import {biometricsScenarioRequiredFactors} from '@/src/libs/Biometrics/scenarios';
import {BiometricsPartialStatus} from '@hooks/useBiometricsStatus/types';
import {BiometricsFactor, BiometricsFallbackFactor, BiometricsFallbackFactors, BiometricsFallbackScenario, BiometricsFallbackScenarioParams} from '@libs/Biometrics/scenarios/types';
import CONST from '@src/CONST';

/**
 * Checks if all required authentication factors are present.
 * Handles validation code and OTP requirements based on the current flow state.
 * Returns success if all required factors are present, otherwise returns which factor is missing.
 */
function verifyRequiredFactors({
    otp,
    validateCode,
    requiredFactors,
    isFirstFactorVerified,
}: {
    otp?: number;
    validateCode?: number;
    requiredFactors: readonly BiometricsFactor[];
    isFirstFactorVerified: boolean;
}): BiometricsPartialStatus<BiometricsFactor | true, true> {
    const isValidateCodeRequired = requiredFactors.includes(CONST.BIOMETRICS.FACTORS.VALIDATE_CODE);
    const isOtpRequired = requiredFactors.includes(CONST.BIOMETRICS.FACTORS.OTP) && (!isValidateCodeRequired || isFirstFactorVerified);

    /** Check that we have everything we need to proceed */
    if (isValidateCodeRequired && !validateCode) {
        return {
            value: CONST.BIOMETRICS.FACTORS.VALIDATE_CODE,
            reason: 'biometrics.reason.error.validateCodeMissing',
        };
    }

    if (isOtpRequired && !otp) {
        return {
            value: CONST.BIOMETRICS.FACTORS.OTP,
            reason: 'biometrics.reason.error.otpMissing',
        };
    }

    return {
        value: true,
        reason: 'biometrics.reason.generic.authFactorsSufficient',
    };
}

/**
 * Takes a biometrics factor (like OTP or validate code) and converts it to the corresponding
 * parameter name that will be used in the fallback authentication flow. For example,
 * converts the factor "VALIDATE_CODE" to the parameter name "validateCode".
 */
function convertBiometricsFactorToParameterName<T extends BiometricsFallbackScenario>(factor: BiometricsFallbackFactor) {
    return CONST.BIOMETRICS.FACTORS_REQUIREMENTS[factor].parameter as keyof BiometricsFallbackFactors<T>;
}

function areBiometricsFallbackParamsValid<T extends BiometricsFallbackScenario>(scenario: T, params: Record<string, unknown>): params is BiometricsFallbackScenarioParams<T> {
    return Object.keys(params).every((key) => {
        return biometricsScenarioRequiredFactors[scenario].find((factor) => CONST.BIOMETRICS.FACTORS_REQUIREMENTS[factor].parameter === key);
    });
}

export {verifyRequiredFactors, convertBiometricsFactorToParameterName, areBiometricsFallbackParamsValid};

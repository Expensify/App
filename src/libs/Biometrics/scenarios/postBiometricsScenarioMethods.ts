/**
 * This module defines the post-processing logic for different biometric authentication scenarios.
 * It handles the logic for storing validation codes, OTPs, and determining the next required authentication factor.
 */
import {BiometricsScenarioPostMethod} from '@libs/Biometrics/scenarios/types';
import CONST from '@src/CONST';

/**
 * Handles the post-processing of a transaction authorization attempt when biometrics is not available.
 * Takes the authorization result and request parameters and determines:
 * - If an OTP (one-time password) is required based on the HTTP response code
 * - The appropriate error message to display based on which codes were invalid
 * - Whether to store the validation code for future use
 * - The next required authentication factor (OTP if needed)
 * - Whether the overall request was successful and is now complete
 */
const postAuthorizeTransactionFallback: BiometricsScenarioPostMethod<typeof CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION_FALLBACK> = (result, requestParams) => {
    const {successful, httpCode} = result.value;
    const {otp, validateCode} = requestParams;

    const isOTPRequired = httpCode === 202;

    let reason = result.reason;

    if (result.reason !== 'biometrics.apiResponse.unableToAuthorize') {
        reason = result.reason;
    } else if (!!otp && !!validateCode) {
        reason = 'biometrics.apiResponse.otpCodeInvalid';
    } else if (!otp && !!validateCode) {
        reason = 'biometrics.apiResponse.validationCodeInvalid';
    }

    return {
        ...result,
        value: validateCode && isOTPRequired && successful ? validateCode : undefined,
        step: {
            requiredFactorForNextStep: isOTPRequired ? CONST.BIOMETRICS.FACTORS.OTP : undefined,
            wasRecentStepSuccessful: successful,
            isRequestFulfilled: !successful || !isOTPRequired,
        },
        reason,
    };
};

export {postAuthorizeTransactionFallback};

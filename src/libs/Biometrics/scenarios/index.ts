/**
 * This module defines the available biometric authentication scenarios and their parameters.
 * It maps each scenario type to its corresponding implementation method and any post-processing logic.
 * The scenarios include setting up biometrics and authorizing transactions with different authentication flows.
 */
import router from '@/mocks/api/router';
import {PHONE_NUMBER, STORAGE, USER_EMAIL} from '@/mocks/api/utils';
import {authorizeTransaction, registerBiometrics} from '@libs/actions/Biometrics';
import {requestValidateCodeAction} from '@libs/actions/User';
import {postAuthorizeTransactionFallback} from '@libs/Biometrics/scenarios/postBiometricsScenarioMethods';
import {BiometricsRequiredFactorsRecord, BiometricsScenarioMap} from '@libs/Biometrics/scenarios/types';
import CONST from '@src/CONST';

/**
 * Defines the required parameters for each biometric scenario type.
 * Each scenario requires specific parameters:
 * - Regular transaction authorization needs a transaction ID
 * - Authorization with validation code needs a transaction ID
 * - Fallback authorization needs a transaction ID
 * - Biometrics setup needs a public key
 */
type BiometricsScenarioParameters = {
    [CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION]: {
        transactionID: string;
    };
    [CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION_WITH_VALIDATE_CODE]: {
        transactionID: string;
    };
    [CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION_FALLBACK]: {
        transactionID: string;
    };
    [CONST.BIOMETRICS.SCENARIO.SETUP_BIOMETRICS]: {
        publicKey: string;
    };
};

const biometricsScenarioRequiredFactors = {
    [CONST.BIOMETRICS.SCENARIO.SETUP_BIOMETRICS]: [CONST.BIOMETRICS.FACTORS.VALIDATE_CODE],
    [CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION]: [CONST.BIOMETRICS.FACTORS.SIGNED_CHALLENGE],
    [CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION_WITH_VALIDATE_CODE]: [CONST.BIOMETRICS.FACTORS.SIGNED_CHALLENGE, CONST.BIOMETRICS.FACTORS.VALIDATE_CODE],
    [CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION_FALLBACK]: [CONST.BIOMETRICS.FACTORS.VALIDATE_CODE, CONST.BIOMETRICS.FACTORS.OTP],
    [CONST.BIOMETRICS.SCENARIO.TEST_OTP_FIRST]: [CONST.BIOMETRICS.FACTORS.OTP, CONST.BIOMETRICS.FACTORS.VALIDATE_CODE],
} as const satisfies BiometricsRequiredFactorsRecord;

/**
 * Maps each biometric scenario to its implementation details.
 * Regular scenarios just need a scenario method.
 * The fallback scenario includes additional post-processing and validation code storage.
 */
const biometricsScenarios = {
    [CONST.BIOMETRICS.SCENARIO.SETUP_BIOMETRICS]: {
        scenarioMethod: registerBiometrics,
    },
    [CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION]: {
        scenarioMethod: authorizeTransaction,
    },
    [CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION_WITH_VALIDATE_CODE]: {
        scenarioMethod: authorizeTransaction,
    },
    [CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION_FALLBACK]: {
        scenarioMethod: authorizeTransaction,
        missingFactorMiddleware: async (missingFactor) => {
            if (missingFactor === CONST.BIOMETRICS.FACTORS.VALIDATE_CODE) {
                requestValidateCodeAction();
            }
        },
        postScenarioMethod: postAuthorizeTransactionFallback,
        factorToStore: CONST.BIOMETRICS.FACTORS.VALIDATE_CODE,
    },
    [CONST.BIOMETRICS.SCENARIO.TEST_OTP_FIRST]: {
        scenarioMethod: async (params) => {
            const {validateCode, otp} = params;

            if (!otp) {
                return {
                    httpCode: 400,
                    reason: 'biometrics.reason.error.otpMissing',
                };
            }

            if (!validateCode) {
                requestValidateCodeAction();
                return {
                    httpCode: 400,
                    reason: 'biometrics.reason.error.validateCodeMissing',
                };
            }

            const isOK = STORAGE.OTPs[PHONE_NUMBER].includes(otp) && STORAGE.validateCodes[USER_EMAIL].includes(validateCode);

            return {
                httpCode: isOK ? 200 : 400,
                reason: isOK ? 'biometrics.reason.apiResponse.userAuthorized' : 'biometrics.reason.apiResponse.unableToAuthorize',
            };
        },
        missingFactorMiddleware: async (missingFactor) => {
            if (missingFactor === CONST.BIOMETRICS.FACTORS.VALIDATE_CODE) {
                requestValidateCodeAction();
            } else if (missingFactor === CONST.BIOMETRICS.FACTORS.OTP) {
                await router('/send_otp', {
                    method: 'POST',
                    body: {
                        phoneNumber: PHONE_NUMBER,
                    },
                });
            }
        },
    },
} as const satisfies BiometricsScenarioMap;

export {biometricsScenarios, biometricsScenarioRequiredFactors};
export type {BiometricsScenarioParameters};

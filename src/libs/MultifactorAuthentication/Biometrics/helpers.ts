import type {ValueOf} from 'type-fest';
import MULTI_FACTOR_AUTHENTICATION_SCENARIOS from '@components/MultifactorAuthenticationContext/config';
import {registerBiometrics} from '@libs/actions/MultifactorAuthentication';
import type {TranslationPaths} from '@src/languages/types';
import type {
    AllMultifactorAuthenticationFactors,
    MFAChallenge,
    MultifactorAuthenticationFactor,
    MultifactorAuthenticationPartialStatus,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioMap,
    MultifactorAuthenticationScenarioParams,
    MultifactorAuthenticationScenarioResponseWithSuccess,
    SignedChallenge,
} from './types';
import VALUES from './VALUES';

function factorMissingReason(factor: MultifactorAuthenticationFactor): TranslationPaths {
    if (factor === VALUES.FACTORS.VALIDATE_CODE) {
        return 'multifactorAuthentication.reason.error.validateCodeMissing';
    }

    if (factor === VALUES.FACTORS.OTP) {
        return 'multifactorAuthentication.reason.error.otpMissing';
    }

    if (factor === VALUES.FACTORS.SIGNED_CHALLENGE) {
        return 'multifactorAuthentication.reason.error.signatureMissing';
    }

    return 'multifactorAuthentication.reason.generic.authFactorsError';
}

function factorInvalidReason(factor: MultifactorAuthenticationFactor): TranslationPaths {
    if (factor === VALUES.FACTORS.VALIDATE_CODE) {
        return 'multifactorAuthentication.apiResponse.validationCodeInvalid';
    }

    if (factor === VALUES.FACTORS.OTP) {
        return 'multifactorAuthentication.apiResponse.otpCodeInvalid';
    }

    if (factor === VALUES.FACTORS.SIGNED_CHALLENGE) {
        return 'multifactorAuthentication.apiResponse.signatureInvalid';
    }

    return 'multifactorAuthentication.reason.generic.authFactorsError';
}

/**
 * Validates that all required authentication factors are present and of the correct type/format.
 * Checks each factor's presence, type, and length requirements.
 * Skips OTP validation if the validation code hasn't been verified yet.
 */
function areMultifactorAuthenticationFactorsSufficient(
    factors: Partial<AllMultifactorAuthenticationFactors>,
    factorsCombination: ValueOf<typeof VALUES.FACTOR_COMBINATIONS>,
    isStoredFactorVerified = true,
    is2FAEnabled = false,
): MultifactorAuthenticationPartialStatus<true | string> {
    const requiredFactors = factorsCombination.map((id) => VALUES.FACTORS_REQUIREMENTS[id]);

    for (const {id, parameter, name, length} of requiredFactors) {
        if (id !== VALUES.FACTORS.VALIDATE_CODE && !isStoredFactorVerified && !is2FAEnabled) {
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
                reason: factorMissingReason(id),
            };
        }

        const value = factors[parameter];

        if (typeof length === 'number' && (typeof value === 'string' || typeof value === 'number') && String(value).length !== length) {
            return {
                value: `Invalid length for factor: ${name} (${parameter}). Expected length ${length}, got length ${String(value).length}`,
                step: unsuccessfulStep,
                reason: factorInvalidReason(id),
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
        reason: 'multifactorAuthentication.reason.generic.authFactorsSufficient',
    };
}

/**
 * Handles the post-processing of an authorization attempt when multifactorial authentication is not available.
 * Takes the authorization result and request parameters and determines:
 * - If an OTP (one-time password) is required based on the HTTP response code
 * - The appropriate error message to display based on which codes were invalid
 * - Whether to store the validation code for future use
 * - The next required authentication factor (OTP if needed)
 * - Whether the overall request was successful and is now complete
 */
const authorizeMultifactorAuthenticationPostMethod = <T extends MultifactorAuthenticationScenario>(
    status: MultifactorAuthenticationPartialStatus<MultifactorAuthenticationScenarioResponseWithSuccess, true>,
    params: MultifactorAuthenticationScenarioParams<T>,
    failedFactor?: MultifactorAuthenticationFactor,
) => {
    const {successful, httpCode} = status.value;
    const {otp, validateCode} = params;

    const isOTPRequired = httpCode === VALUES.NEED_SECOND_FACTOR_HTTP_CODE;

    let reason = status.reason;

    if (status.reason !== 'multifactorAuthentication.apiResponse.unableToAuthorize') {
        reason = status.reason;
    } else if (!!otp && !!validateCode) {
        reason = 'multifactorAuthentication.apiResponse.otpCodeInvalid';
    } else if (!otp && !!validateCode) {
        reason = 'multifactorAuthentication.apiResponse.validationCodeInvalid';
    }

    return {
        ...status,
        value: validateCode && isOTPRequired && successful ? validateCode : undefined,
        step: {
            requiredFactorForNextStep: isOTPRequired ? VALUES.FACTORS.OTP : failedFactor,
            wasRecentStepSuccessful: successful,
            isRequestFulfilled: !failedFactor && !isOTPRequired,
        },
        reason,
    };
};

const registerMultifactorAuthenticationPostMethod = (
    status: MultifactorAuthenticationPartialStatus<MultifactorAuthenticationScenarioResponseWithSuccess, true>,
    params: Partial<AllMultifactorAuthenticationFactors> & {publicKey: string},
    failedFactor?: MultifactorAuthenticationFactor,
) => {
    const {successful} = status.value;
    const {validateCode} = params;

    let reason = status.reason;

    if (status.reason !== 'multifactorAuthentication.apiResponse.unableToAuthorize') {
        reason = status.reason;
    } else if (validateCode) {
        reason = 'multifactorAuthentication.apiResponse.validationCodeInvalid';
    } else if (!validateCode) {
        reason = 'multifactorAuthentication.reason.error.validateCodeMissing';
    }

    return {
        ...status,
        value: successful,
        step: {
            requiredFactorForNextStep: failedFactor,
            wasRecentStepSuccessful: successful,
            isRequestFulfilled: !failedFactor,
        },
        reason,
    };
};

async function processMultifactorAuthenticationRegistration(
    params: Partial<AllMultifactorAuthenticationFactors> & {publicKey: string},
): Promise<MultifactorAuthenticationPartialStatus<boolean>> {
    const factorsCheckResult = areMultifactorAuthenticationFactorsSufficient(params, VALUES.FACTOR_COMBINATIONS.REGISTRATION, true);

    if (factorsCheckResult.value !== true) {
        return registerMultifactorAuthenticationPostMethod(
            {
                ...factorsCheckResult,
                value: {httpCode: undefined, successful: false},
            },
            params,
            factorsCheckResult.step.requiredFactorForNextStep,
        );
    }

    const {httpCode, reason} = await registerBiometrics(params);

    return registerMultifactorAuthenticationPostMethod(
        {
            value: {
                successful: String(httpCode).startsWith('2'),
                httpCode,
            },
            reason,
        },
        params,
    );
}

/**
 * Main authorization function that handles different multifactorial authentication scenarios.
 * First validates that all required factors are present and valid.
 * Then sends the authorization request to the server.
 * Finally, post-processes the result based on the scenario type.
 * Returns a status object containing the authorization result and any additional information needed.
 */
async function processMultifactorAuthenticationScenario<T extends MultifactorAuthenticationScenario>(
    scenario: T,
    params: MultifactorAuthenticationScenarioParams<T>,
    factorsCombination: ValueOf<typeof VALUES.FACTOR_COMBINATIONS>,
    isStoredFactorVerified?: boolean,
): Promise<MultifactorAuthenticationPartialStatus<number | undefined>> {
    const factorsCheckResult = areMultifactorAuthenticationFactorsSufficient(params, factorsCombination, isStoredFactorVerified);

    const currentScenario = MULTI_FACTOR_AUTHENTICATION_SCENARIOS[scenario] as MultifactorAuthenticationScenarioMap[T];

    if (factorsCheckResult.value !== true) {
        return authorizeMultifactorAuthenticationPostMethod(
            {
                ...factorsCheckResult,
                value: {httpCode: undefined, successful: false},
            },
            params,
            factorsCheckResult.step.requiredFactorForNextStep,
        );
    }

    const {httpCode, reason} = await currentScenario.action(params);

    return authorizeMultifactorAuthenticationPostMethod(
        {
            value: {
                successful: String(httpCode).startsWith('2'),
                httpCode,
            },
            reason,
        },
        params,
    );
}

/**
 * Takes an error from SecureStore and maps it to a translation path based on the error message.
 * Parses the error string using a separator and searches for known error patterns.
 * Returns a generic error translation if no specific mapping is found.
 */
function decodeExpoMessage(error: unknown): TranslationPaths {
    const errorString = String(error);
    const parts = errorString.split(VALUES.EXPO_ERRORS.SEPARATOR);
    const searchString = parts.length > 1 ? parts.slice(1).join(';').trim() : errorString;

    const errorMappings = {
        [VALUES.EXPO_ERRORS.SEARCH_STRING.CANCELED]: 'multifactorAuthentication.reason.expoErrors.canceled',
        [VALUES.EXPO_ERRORS.SEARCH_STRING.IN_PROGRESS]: 'multifactorAuthentication.reason.expoErrors.alreadyInProgress',
        [VALUES.EXPO_ERRORS.SEARCH_STRING.NOT_IN_FOREGROUND]: 'multifactorAuthentication.reason.expoErrors.notInForeground',
        [VALUES.EXPO_ERRORS.SEARCH_STRING.EXISTS]: 'multifactorAuthentication.reason.expoErrors.keyExists',
        [VALUES.EXPO_ERRORS.SEARCH_STRING.NO_AUTHENTICATION]: 'multifactorAuthentication.reason.expoErrors.noAuthentication',
        [VALUES.EXPO_ERRORS.SEARCH_STRING.OLD_ANDROID]: 'multifactorAuthentication.reason.expoErrors.oldAndroid',
    } as const;

    for (const [searchKey, translationPath] of Object.entries(errorMappings)) {
        if (searchString.includes(searchKey)) {
            return translationPath as TranslationPaths;
        }
    }

    return 'multifactorAuthentication.reason.expoErrors.generic';
}

/**
 * Converts Expo SecureStore error messages into user-friendly translation paths.
 * First attempts to map the error to a specific translation using decodeExpoMessage.
 * If the error maps to a generic message and a fallback is provided, returns the fallback instead.
 * This allows for more specific error messaging in known error scenarios.
 */
const decodeMultifactorAuthenticationExpoMessage = (message: unknown, fallback?: TranslationPaths): TranslationPaths => {
    const decodedMessage = decodeExpoMessage(message);
    return decodedMessage === 'multifactorAuthentication.reason.expoErrors.generic' && fallback ? fallback : decodedMessage;
};

function isChallengeSigned(challenge: MFAChallenge | SignedChallenge): challenge is SignedChallenge {
    return 'rawId' in challenge;
}

export {
    processMultifactorAuthenticationScenario as processScenario,
    areMultifactorAuthenticationFactorsSufficient as areFactorsSufficient,
    decodeMultifactorAuthenticationExpoMessage as decodeExpoMessage,
    isChallengeSigned,
    processMultifactorAuthenticationRegistration as processRegistration,
};

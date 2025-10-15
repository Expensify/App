import type {TranslationPaths} from '@src/languages/types';
import MULTI_FACTOR_AUTHENTICATION_SCENARIOS from './scenarios';
import type {
    AllMultifactorAuthenticationFactors,
    MultifactorAuthenticationPartialStatus,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioMap,
    MultifactorAuthenticationScenarioParams,
    MultifactorAuthenticationScenarioResponseWithSuccess,
    MultifactorAuthorizationFallbackScenario,
    MultifactorAuthorizationFallbackScenarioParams,
} from './types';
import VALUES from './VALUES';

/**
 * Validates that all required authentication factors are present and of the correct type/format.
 * Checks each factor's presence, type, and length requirements.
 * Skips OTP validation if the validation code hasn't been verified yet.
 */
function areMultifactorAuthenticationFactorsSufficient(
    factors: Partial<AllMultifactorAuthenticationFactors>,
    isStoredFactorVerified = true,
    multifactorAuthentication = false,
): MultifactorAuthenticationPartialStatus<true | string> {
    const requiredFactors = VALUES.FACTOR_COMBINATIONS[multifactorAuthentication ? 'MULTI_FACTOR_AUTHENTICATION' : 'TWO_FACTOR'].map((id) => VALUES.FACTORS_REQUIREMENTS[id]);

    for (const {id, parameter, name, type, length} of requiredFactors) {
        if (id !== VALUES.FACTORS.VALIDATE_CODE && !isStoredFactorVerified) {
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
                reason: 'multifactorAuthentication.reason.generic.authFactorsError',
            };
        }

        const value = factors[parameter];

        if (typeof value !== typeof type) {
            return {
                value: `Invalid type for factor: ${name} (${parameter}). Expected ${typeof type}, got ${typeof value}`,
                step: unsuccessfulStep,
                reason: 'multifactorAuthentication.reason.generic.authFactorsError',
            };
        }

        if (typeof length === 'number' && String(value).length !== length) {
            return {
                value: `Invalid length for factor: ${name} (${parameter}). Expected length ${length}, got length ${String(value).length}`,
                step: unsuccessfulStep,
                reason: 'multifactorAuthentication.reason.generic.authFactorsError',
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
const authorizeMultifactorAuthenticationPostMethodFallback = <T extends MultifactorAuthorizationFallbackScenario>(
    status: MultifactorAuthenticationPartialStatus<MultifactorAuthenticationScenarioResponseWithSuccess, true>,
    params: MultifactorAuthorizationFallbackScenarioParams<T>,
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
            requiredFactorForNextStep: isOTPRequired ? VALUES.FACTORS.OTP : undefined,
            wasRecentStepSuccessful: successful,
            isRequestFulfilled: !successful || !isOTPRequired,
        },
        reason,
    };
};

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
    isStoredFactorVerified?: boolean,
    multifactorAuthentication = false,
): Promise<MultifactorAuthenticationPartialStatus<number | undefined>> {
    const factorsCheckResult = areMultifactorAuthenticationFactorsSufficient(params, isStoredFactorVerified, multifactorAuthentication);

    const currentScenario = MULTI_FACTOR_AUTHENTICATION_SCENARIOS[scenario] as MultifactorAuthenticationScenarioMap[T];

    if (factorsCheckResult.value !== true) {
        return authorizeMultifactorAuthenticationPostMethodFallback(
            {
                ...factorsCheckResult,
                value: {httpCode: undefined, successful: false},
            },
            params,
        );
    }

    const {httpCode, reason} = await currentScenario.action(params);

    return authorizeMultifactorAuthenticationPostMethodFallback(
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

export {
    processMultifactorAuthenticationScenario as processScenario,
    areMultifactorAuthenticationFactorsSufficient as areFactorsSufficient,
    decodeMultifactorAuthenticationExpoMessage as decodeExpoMessage,
};

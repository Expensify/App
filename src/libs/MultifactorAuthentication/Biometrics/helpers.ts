import type {ValueOf} from 'type-fest';
import {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from '@components/MultifactorAuthentication/config';
import type {
    MultifactorAuthenticationProcessScenarioParameters,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioConfig,
    MultifactorAuthenticationScenarioParams,
    MultifactorAuthenticationScenarioResponseWithSuccess,
} from '@components/MultifactorAuthentication/config/types';
import {registerBiometrics} from '@libs/actions/MultifactorAuthentication';
import type {TranslationPaths} from '@src/languages/types';
import {base64URL} from './ED25519';
import type {Base64URL, MultifactorAuthenticationChallengeObject, SignedChallenge} from './ED25519/types';
import type {
    AllMultifactorAuthenticationFactors,
    MultifactorAuthenticationFactor,
    MultifactorAuthenticationKeyInfo,
    MultifactorAuthenticationPartialStatus,
    MultifactorAuthenticationResponseTranslationPath,
} from './types';
import VALUES, {MULTIFACTOR_AUTHENTICATION_ERROR_MAPPINGS} from './VALUES';

/** Helper method to create an object with an HTTP code and the reason translation path */
function parseHttpCode(
    jsonCode: string | number | undefined,
    source: ValueOf<Omit<MultifactorAuthenticationResponseTranslationPath, 'UNKNOWN'>>,
): {
    httpCode: number;
    reason: TranslationPaths;
} {
    const httpCode = Number(jsonCode) || 0;
    const translation = source[httpCode as keyof typeof source] ?? VALUES.RESPONSE_TRANSLATION_PATH.UNKNOWN;

    return {
        httpCode,
        reason: `multifactorAuthentication.apiResponse.${translation}` as TranslationPaths,
    };
}

function factorMissingReason(factor: MultifactorAuthenticationFactor): TranslationPaths {
    return MULTIFACTOR_AUTHENTICATION_ERROR_MAPPINGS.FACTOR_MISSING_REASONS[factor] ?? 'multifactorAuthentication.reason.generic.authFactorsError';
}

function factorInvalidReason(factor: MultifactorAuthenticationFactor): TranslationPaths {
    return MULTIFACTOR_AUTHENTICATION_ERROR_MAPPINGS.FACTOR_INVALID_REASONS[factor] ?? 'multifactorAuthentication.reason.generic.authFactorsError';
}

/**
 * Creates an unsuccessful step object for factor validation failures
 */
function createUnsuccessfulStep(requiredFactor: MultifactorAuthenticationFactor) {
    return {
        requiredFactorForNextStep: requiredFactor,
        wasRecentStepSuccessful: false,
        isRequestFulfilled: false,
    };
}

/**
 * Validates that all required authentication factors are present and of the correct type/format.
 * Checks each factor's presence, type, and length requirements.
 */
function areMultifactorAuthenticationFactorsSufficient(
    factors: Partial<AllMultifactorAuthenticationFactors>,
    factorsCombination: ValueOf<typeof VALUES.FACTOR_COMBINATIONS>,
): MultifactorAuthenticationPartialStatus<true | string> {
    const requiredFactors = factorsCombination.map((id) => VALUES.FACTORS_REQUIREMENTS[id]);

    for (const {id, parameter, name, length} of requiredFactors) {
        const value = factors[parameter];

        // Check if factor is missing
        if (value === undefined) {
            return {
                value: `Missing required factor: ${name} (${parameter})`,
                step: createUnsuccessfulStep(id),
                reason: factorMissingReason(id),
            };
        }

        // Check if factor length is valid (if length requirement exists)
        if (typeof length === 'number' && (typeof value === 'string' || typeof value === 'number')) {
            const valueLength = String(value).length;
            if (valueLength !== length) {
                return {
                    value: `Invalid length for factor: ${name} (${parameter}). Expected length ${length}, got length ${valueLength}`,
                    step: createUnsuccessfulStep(id),
                    reason: factorInvalidReason(id),
                };
            }
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
 * - The appropriate error message to display based on which codes were invalid
 * - Whether to store the validation code for future use
 * - Whether the overall request was successful and is now complete
 */
const authorizeMultifactorAuthenticationPostMethod = <T extends MultifactorAuthenticationScenario>(
    status: MultifactorAuthenticationPartialStatus<MultifactorAuthenticationScenarioResponseWithSuccess, true>,
    params: MultifactorAuthenticationScenarioParams<T>,
    failedFactor?: MultifactorAuthenticationFactor,
) => {
    const {successful} = status.value;
    const {validateCode} = params;

    // Determine the appropriate error reason
    let reason = status.reason;

    if (status.reason !== 'multifactorAuthentication.apiResponse.unableToAuthorize') {
        reason = status.reason;
    } else if (!validateCode) {
        reason = 'multifactorAuthentication.apiResponse.validationCodeInvalid';
    }

    return {
        ...status,
        value: validateCode && successful ? validateCode : undefined,
        step: {
            requiredFactorForNextStep: failedFactor,
            wasRecentStepSuccessful: successful,
            isRequestFulfilled: !failedFactor,
        },
        reason,
    };
};

const registerMultifactorAuthenticationPostMethod = (
    status: MultifactorAuthenticationPartialStatus<MultifactorAuthenticationScenarioResponseWithSuccess, true>,
    params: Partial<AllMultifactorAuthenticationFactors> & {publicKey: string},
    failedFactor?: MultifactorAuthenticationFactor,
): MultifactorAuthenticationPartialStatus<boolean> => {
    const {successful} = status.value;
    const {validateCode} = params;

    // Determine the appropriate error reason
    let reason = status.reason;
    if (status.reason === 'multifactorAuthentication.apiResponse.unableToAuthorize') {
        reason = validateCode ? 'multifactorAuthentication.apiResponse.validationCodeInvalid' : 'multifactorAuthentication.reason.error.validateCodeMissing';
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

function createKeyInfoObject({accountID, publicKey}: {accountID: number; publicKey: string}): MultifactorAuthenticationKeyInfo<'biometric'> {
    const rawId: Base64URL<string> = base64URL(`${accountID}_${VALUES.KEY_ALIASES.PUBLIC_KEY}`);
    const type = VALUES.ED25519_TYPE;
    const response = {
        biometric: {publicKey: base64URL(publicKey)},
    };

    return {
        rawId,
        type,
        response,
    };
}

async function processMultifactorAuthenticationRegistration(
    params: Partial<AllMultifactorAuthenticationFactors> & {accountID: number; publicKey: string},
): Promise<MultifactorAuthenticationPartialStatus<boolean>> {
    const factorsCheckResult = areMultifactorAuthenticationFactorsSufficient(params, VALUES.FACTOR_COMBINATIONS.REGISTRATION);

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

    const keyInfo = createKeyInfoObject(params);

    const {httpCode, reason} = await registerBiometrics({
        keyInfo,
        validateCode: params.validateCode,
    });

    const successful = String(httpCode).startsWith('2');

    return registerMultifactorAuthenticationPostMethod(
        {
            value: {successful, httpCode},
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
    params: MultifactorAuthenticationProcessScenarioParameters<T>,
    factorsCombination: ValueOf<typeof VALUES.FACTOR_COMBINATIONS>,
): Promise<MultifactorAuthenticationPartialStatus<number | undefined>> {
    const factorsCheckResult = areMultifactorAuthenticationFactorsSufficient(params, factorsCombination);

    const currentScenario = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario] as MultifactorAuthenticationScenarioConfig;

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

    // We can safely make this assertion because the factors check method guarantees that the necessary conditions are met
    const {httpCode, reason} = await currentScenario.action(params);
    const successful = String(httpCode).startsWith('2');

    return authorizeMultifactorAuthenticationPostMethod(
        {
            value: {successful, httpCode},
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

    for (const [searchKey, translationPath] of Object.entries(MULTIFACTOR_AUTHENTICATION_ERROR_MAPPINGS.EXPO_ERROR_MAPPINGS)) {
        if (searchString.includes(searchKey)) {
            return translationPath;
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

function isChallengeSigned(challenge: MultifactorAuthenticationChallengeObject | SignedChallenge): challenge is SignedChallenge {
    return 'rawId' in challenge;
}

export {
    processMultifactorAuthenticationScenario as processScenario,
    decodeMultifactorAuthenticationExpoMessage as decodeExpoMessage,
    isChallengeSigned,
    processMultifactorAuthenticationRegistration as processRegistration,
    parseHttpCode,
};

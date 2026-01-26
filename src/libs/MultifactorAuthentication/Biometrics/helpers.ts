/**
 * Helper utilities for multifactor authentication biometrics operations.
 */
import type {Entries, ValueOf} from 'type-fest';
import {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from '@components/MultifactorAuthentication/config';
import type {
    MultifactorAuthenticationProcessScenarioParameters,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioConfig,
    MultifactorAuthenticationScenarioParams,
    MultifactorAuthenticationScenarioResponseWithSuccess,
} from '@components/MultifactorAuthentication/config/types';
import {registerAuthenticationKey} from '@userActions/MultifactorAuthentication';
import type {MultifactorAuthenticationChallengeObject, SignedChallenge} from './ED25519/types';
import type {
    AllMultifactorAuthenticationFactors,
    MultifactorAuthenticationFactor,
    MultifactorAuthenticationKeyInfo,
    MultifactorAuthenticationPartialStatus,
    MultifactorAuthenticationReason,
    MultifactorAuthenticationResponseMap,
    ResponseDetails,
} from './types';
import VALUES, {MULTIFACTOR_AUTHENTICATION_ERROR_MAPPINGS} from './VALUES';

type ParseHTTPSource = ValueOf<MultifactorAuthenticationResponseMap>;

const httpCodeIsDefined = (source: ParseHTTPSource, httpCode: number): httpCode is keyof ParseHTTPSource => Object.keys(source).some((key) => Number(key) === httpCode);

const findMessageInSource = (source: ParseHTTPSource[keyof ParseHTTPSource], message: string | undefined): MultifactorAuthenticationReason => {
    if (!message) {
        return VALUES.REASON.BACKEND.UNKNOWN_RESPONSE;
    }

    const sourceEntries = Object.entries(source) as Entries<typeof source>;
    const [, value] = sourceEntries.find(([, predefinedMessage]) => predefinedMessage === message) ?? [];
    return value ?? VALUES.REASON.BACKEND.UNKNOWN_RESPONSE;
};

/**
 * Parses an HTTP response code along with a message and returns the corresponding HTTP code and reason.
 */
function parseHttpRequest(
    jsonCode: string | number | undefined,
    source: ParseHTTPSource,
    message: string | undefined,
): {
    httpCode: number;
    reason: MultifactorAuthenticationReason;
} {
    const httpCode = Number(jsonCode ?? 0);

    if (!httpCodeIsDefined(source, httpCode)) {
        return {
            httpCode,
            reason: VALUES.REASON.BACKEND.UNKNOWN_RESPONSE,
        };
    }

    if (httpCode === 200) {
        return {
            httpCode,
            reason: source[200],
        };
    }

    const codes = source[httpCode];

    return {
        httpCode,
        reason: findMessageInSource(codes, message),
    };
}

/**
 * Returns the appropriate error reason when a required authentication factor is missing.
 */
function factorMissingReason(factor: MultifactorAuthenticationFactor): MultifactorAuthenticationReason {
    return MULTIFACTOR_AUTHENTICATION_ERROR_MAPPINGS.FACTOR_MISSING_REASONS[factor] ?? VALUES.REASON.GENERIC.FACTORS_ERROR;
}

/**
 * Returns the appropriate error reason when an authentication factor is invalid.
 */
function factorInvalidReason(factor: MultifactorAuthenticationFactor): MultifactorAuthenticationReason {
    return MULTIFACTOR_AUTHENTICATION_ERROR_MAPPINGS.FACTOR_INVALID_REASONS[factor] ?? VALUES.REASON.GENERIC.FACTORS_ERROR;
}

/**
 * Creates an unsuccessful step result with the required factor for the next step.
 */
function createUnsuccessfulStep(requiredFactor: MultifactorAuthenticationFactor) {
    return {
        requiredFactorForNextStep: requiredFactor,
        wasRecentStepSuccessful: false,
        isRequestFulfilled: false,
    };
}

/**
 * Validates that all required authentication factors are present and valid.
 * Checks factor existence and validates factor length if applicable.
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
        reason: VALUES.REASON.GENERIC.FACTORS_VERIFIED,
    };
}

/**
 * Processes the authorization response and determines the next step in the authentication flow.
 */
const transformMultifactorAuthenticationActionResponse = <T extends MultifactorAuthenticationScenario>(
    status: MultifactorAuthenticationPartialStatus<MultifactorAuthenticationScenarioResponseWithSuccess, true>,
    params: MultifactorAuthenticationScenarioParams<T>,
    failedFactor?: MultifactorAuthenticationFactor,
) => {
    const {successful} = status.value;
    const {validateCode} = params;

    return {
        ...status,
        value: validateCode && successful ? validateCode : undefined,
        step: {
            requiredFactorForNextStep: failedFactor,
            wasRecentStepSuccessful: successful,
            isRequestFulfilled: !failedFactor,
        },
        reason: status.reason,
    };
};

const registerMultifactorAuthenticationPostMethod = (
    status: MultifactorAuthenticationPartialStatus<MultifactorAuthenticationScenarioResponseWithSuccess, true>,
    failedFactor?: MultifactorAuthenticationFactor,
): MultifactorAuthenticationPartialStatus<boolean> => {
    const {successful} = status.value;

    return {
        ...status,
        value: successful,
        step: {
            requiredFactorForNextStep: failedFactor,
            wasRecentStepSuccessful: successful,
            isRequestFulfilled: !failedFactor,
        },
        reason: status.reason,
    };
};

function createKeyInfoObject({publicKey}: {publicKey: string}): MultifactorAuthenticationKeyInfo<'biometric'> {
    // rawId should be the base64url-encoded public key itself, serving as a unique credential identifier
    const rawId: Base64URLString = publicKey;
    const type = VALUES.ED25519_TYPE;
    const response: ResponseDetails<'biometric'> = {
        biometric: {
            publicKey,
            algorithm: -8 as const, // ED25519 per COSE spec
        },
    };

    return {
        rawId,
        type,
        response,
    };
}

async function processMultifactorAuthenticationRegistration(
    params: Partial<AllMultifactorAuthenticationFactors> & {publicKey: string},
): Promise<MultifactorAuthenticationPartialStatus<boolean>> {
    const factorsCheckResult = areMultifactorAuthenticationFactorsSufficient(params, VALUES.FACTOR_COMBINATIONS.REGISTRATION);

    if (factorsCheckResult.value !== true) {
        return registerMultifactorAuthenticationPostMethod(
            {
                ...factorsCheckResult,
                value: {httpCode: undefined, successful: false},
            },
            factorsCheckResult.step.requiredFactorForNextStep,
        );
    }

    const keyInfo = createKeyInfoObject(params);

    const {httpCode, reason} = await registerAuthenticationKey({
        keyInfo,
        validateCode: params.validateCode,
    });

    const successful = String(httpCode).startsWith('2');

    return registerMultifactorAuthenticationPostMethod({
        value: {successful, httpCode},
        reason,
    });
}

/**
 * Processes a multifactor authentication scenario by validating factors and calling the scenario action.
 */
async function processMultifactorAuthenticationScenario<T extends MultifactorAuthenticationScenario>(
    scenario: T,
    params: MultifactorAuthenticationProcessScenarioParameters<T>,
    factorsCombination: ValueOf<typeof VALUES.FACTOR_COMBINATIONS>,
): Promise<MultifactorAuthenticationPartialStatus<number | undefined>> {
    const factorsCheckResult = areMultifactorAuthenticationFactorsSufficient(params, factorsCombination);

    const currentScenario = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario] as MultifactorAuthenticationScenarioConfig;

    if (factorsCheckResult.value !== true) {
        return transformMultifactorAuthenticationActionResponse(
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

    return transformMultifactorAuthenticationActionResponse(
        {
            value: {successful, httpCode},
            reason,
        },
        params,
    );
}

/**
 * Decodes Expo error messages and maps them to authentication error reasons.
 */
function decodeExpoMessage(error: unknown): MultifactorAuthenticationReason {
    const errorString = String(error);
    const parts = errorString.split(VALUES.EXPO_ERRORS.SEPARATOR);
    const searchString = parts.length > 1 ? parts.slice(1).join(';').trim() : errorString;

    for (const [searchKey, errorValue] of Object.entries(MULTIFACTOR_AUTHENTICATION_ERROR_MAPPINGS.EXPO_ERROR_MAPPINGS)) {
        if (searchString.includes(searchKey)) {
            return errorValue;
        }
    }

    return VALUES.REASON.EXPO.GENERIC;
}

/**
 * Decodes an Expo error message with optional fallback for generic errors.
 */
const decodeMultifactorAuthenticationExpoMessage = (message: unknown, fallback?: MultifactorAuthenticationReason): MultifactorAuthenticationReason => {
    const decodedMessage = decodeExpoMessage(message);
    return decodedMessage === VALUES.REASON.EXPO.GENERIC && fallback ? fallback : decodedMessage;
};

/**
 * Type guard to check if a challenge has been signed by verifying the presence of rawId property.
 */
function isChallengeSigned(challenge: MultifactorAuthenticationChallengeObject | SignedChallenge): challenge is SignedChallenge {
    return 'rawId' in challenge;
}

export {
    processMultifactorAuthenticationScenario as processScenario,
    decodeMultifactorAuthenticationExpoMessage as decodeExpoMessage,
    isChallengeSigned,
    processMultifactorAuthenticationRegistration as processRegistration,
    parseHttpRequest,
};

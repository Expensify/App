/**
 * Helper utilities for multifactor authentication biometrics operations.
 */
import type {Entries, ValueOf} from 'type-fest';
import {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from '@components/MultifactorAuthentication/config';
import type {
    MultifactorAuthenticationProcessScenarioParameters,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioConfig,
} from '@components/MultifactorAuthentication/config/types';
import type {MarqetaAuthTypeName} from '@components/MultifactorAuthentication/Context/types';
import {registerAuthenticationKey} from '@userActions/MultifactorAuthentication';
import type {MultifactorAuthenticationChallengeObject, SignedChallenge} from './ED25519/types';
import type {
    AllMultifactorAuthenticationFactors,
    MultifactorAuthenticationKeyInfo,
    MultifactorAuthenticationPartialStatus,
    MultifactorAuthenticationReason,
    MultifactorAuthenticationResponseMap,
    ResponseDetails,
} from './types';
import VALUES from './VALUES';

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
    params: Partial<AllMultifactorAuthenticationFactors> & {publicKey: string; authenticationMethod: MarqetaAuthTypeName},
): Promise<MultifactorAuthenticationPartialStatus<boolean>> {
    if (!params[VALUES.FACTORS.VALIDATE_CODE]) {
        return {
            reason: VALUES.REASON.GENERIC.VALIDATE_CODE_MISSING,
            value: false,
            step: {
                requiredFactorForNextStep: VALUES.FACTORS.VALIDATE_CODE,
                wasRecentStepSuccessful: false,
                isRequestFulfilled: false,
            },
        };
    }

    const keyInfo = createKeyInfoObject(params);

    const {httpCode, reason} = await registerAuthenticationKey({
        keyInfo,
        validateCode: params.validateCode,
        authenticationMethod: params.authenticationMethod,
    });

    const successful = String(httpCode).startsWith('2');

    return {
        value: successful,
        step: {
            requiredFactorForNextStep: undefined,
            wasRecentStepSuccessful: successful,
            isRequestFulfilled: true,
        },
        reason,
    };
}

/**
 * Processes a multifactor authentication scenario by validating factors and calling the scenario action.
 */
async function processMultifactorAuthenticationScenario<T extends MultifactorAuthenticationScenario>(
    scenario: T,
    params: MultifactorAuthenticationProcessScenarioParameters<T> & {authenticationMethod: MarqetaAuthTypeName},
): Promise<MultifactorAuthenticationPartialStatus<number | undefined>> {
    const currentScenario = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario] as MultifactorAuthenticationScenarioConfig;

    if (!params[VALUES.FACTORS.SIGNED_CHALLENGE]) {
        return {
            value: undefined,
            step: {
                requiredFactorForNextStep: VALUES.FACTORS.SIGNED_CHALLENGE,
                wasRecentStepSuccessful: false,
                isRequestFulfilled: false,
            },
            reason: VALUES.REASON.GENERIC.SIGNATURE_MISSING,
        };
    }

    const {httpCode, reason} = await currentScenario.action(params);
    const successful = String(httpCode).startsWith('2');
    const {validateCode} = params;

    return {
        value: validateCode && successful ? validateCode : undefined,
        step: {
            requiredFactorForNextStep: undefined,
            wasRecentStepSuccessful: successful,
            isRequestFulfilled: true,
        },
        reason,
    };
}

/**
 * Decodes Expo error messages and maps them to authentication error reasons.
 */
function decodeExpoMessage(error: unknown): MultifactorAuthenticationReason {
    const errorString = String(error);
    const parts = errorString.split(VALUES.EXPO_ERRORS.SEPARATOR);
    const searchString = parts.length > 1 ? parts.slice(1).join(';').trim() : errorString;

    for (const [searchKey, errorValue] of Object.entries(VALUES.EXPO_ERROR_MAPPINGS)) {
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

import {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from '@components/MultifactorAuthentication/config';
import type {
    MultifactorAuthenticationProcessScenarioParameters,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioConfig,
} from '@components/MultifactorAuthentication/config/types';
import type {MarqetaAuthTypeName, MultifactorAuthenticationKeyInfo, MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/Biometrics/types';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import CONST from '@src/CONST';
import Base64URL from '@src/utils/Base64URL';
import {registerAuthenticationKey} from './index';

type ProcessResult = {
    success: boolean;
    reason: MultifactorAuthenticationReason;
};

/**
 * Determines if an HTTP response code indicates success.
 * Checks if the status code is in the 2xx range.
 *
 * @param httpCode - The HTTP status code to check
 * @returns True if the code is in the 2xx range, false otherwise
 */
function isHttpSuccess(httpCode: number | undefined): boolean {
    return String(httpCode).startsWith('2');
}

type RegistrationParams = {
    publicKey: string;
    authenticationMethod: MarqetaAuthTypeName;
    challenge: string;
    currentPublicKeyIDs: string[];
};

/**
 * Creates a MultifactorAuthenticationKeyInfo object from a public key and challenge.
 * Constructs the required clientDataJSON with base64URL encoding and embeds the public key
 * with ED25519 algorithm information for registration.
 *
 * @param params - Parameters object
 * @param params.publicKey - The public key as a base64URL string
 * @param params.challenge - The challenge string to be embedded in clientDataJSON
 * @returns Key info object with encoded challenge and public key
 */
function createKeyInfoObject({publicKey, challenge}: {publicKey: string; challenge: string}): MultifactorAuthenticationKeyInfo {
    const rawId: Base64URLString = publicKey;

    // Create clientDataJSON with the challenge
    const clientDataJSON = JSON.stringify({challenge});
    const clientDataJSONBase64 = Base64URL.encode(clientDataJSON);

    return {
        rawId,
        type: CONST.MULTIFACTOR_AUTHENTICATION.ED25519_TYPE,
        response: {
            clientDataJSON: clientDataJSONBase64,
            biometric: {
                publicKey,
                algorithm: -8 as const,
            },
        },
    };
}

/**
 * Processes a biometric registration request.
 * Validates the challenge, constructs the key info object, and registers the authentication key
 * with the backend API. Returns success status and reason code.
 *
 * @async
 * @param params - Registration parameters including:
 *   - publicKey: The public key from biometric registration
 *   - authenticationMethod: The biometric method used (face, fingerprint, etc.)
 *   - challenge: The registration challenge from the backend
 *   - currentPublicKeyIDs: Existing public key IDs for this account
 * @returns Object with success status and reason code
 */
async function processRegistration(params: RegistrationParams): Promise<ProcessResult> {
    if (!params.challenge) {
        return {
            success: false,
            reason: VALUES.REASON.CHALLENGE.CHALLENGE_MISSING,
        };
    }

    const keyInfo = createKeyInfoObject({
        publicKey: params.publicKey,
        challenge: params.challenge,
    });

    const {httpCode, reason} = await registerAuthenticationKey({
        keyInfo,
        authenticationMethod: params.authenticationMethod,
        publicKey: params.publicKey,
        currentPublicKeyIDs: params.currentPublicKeyIDs,
    });

    const success = isHttpSuccess(httpCode);

    return {
        success,
        reason,
    };
}

/**
 * Processes a multifactor authentication scenario action.
 * Executes the scenario-specific action with the signed challenge
 * and additional parameters. Returns success status and reason.
 *
 * @async
 * @template T - The type of the multifactor authentication scenario
 * @param scenario - The MFA scenario to process
 * @param params - Scenario parameters including:
 *   - signedChallenge: The signed challenge response from biometric authentication
 *   - authenticationMethod: The biometric method used
 *   - Additional scenario-specific parameters (e.g., transactionID)
 * @returns Object with success status and reason
 */
async function processScenario<T extends MultifactorAuthenticationScenario>(
    scenario: T,
    params: MultifactorAuthenticationProcessScenarioParameters<T> & {authenticationMethod: MarqetaAuthTypeName},
): Promise<ProcessResult> {
    const currentScenario = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario] as MultifactorAuthenticationScenarioConfig;

    if (!params.signedChallenge) {
        return {
            success: false,
            reason: VALUES.REASON.GENERIC.SIGNATURE_MISSING,
        };
    }

    const {httpCode, reason} = await currentScenario.action(params);
    const success = isHttpSuccess(httpCode);

    return {
        success,
        reason,
    };
}

export {processRegistration, processScenario};
export type {ProcessResult, RegistrationParams};

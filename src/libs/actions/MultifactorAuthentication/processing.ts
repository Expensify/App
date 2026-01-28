import {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from '@components/MultifactorAuthentication/config';
import type {
    MultifactorAuthenticationProcessScenarioParameters,
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioConfig,
} from '@components/MultifactorAuthentication/config/types';
import type {MarqetaAuthTypeName, MultifactorAuthenticationKeyInfo, MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/Biometrics/types';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import Base64URL from '@src/utils/Base64URL';
import {registerAuthenticationKey} from './index';

type ProcessResult = {
    success: boolean;
    reason: MultifactorAuthenticationReason;
};

type RegistrationParams = {
    publicKey: string;
    validateCode: string;
    authenticationMethod: MarqetaAuthTypeName;
    challenge: string;
    currentPublicKeyIDs: string[];
};

function createKeyInfoObject({publicKey, challenge}: {publicKey: string; challenge: string}): MultifactorAuthenticationKeyInfo {
    const rawId: Base64URLString = publicKey;

    // Create clientDataJSON with the challenge
    const clientDataJSON = JSON.stringify({challenge});
    const clientDataJSONBase64 = Base64URL.encode(clientDataJSON);

    return {
        rawId,
        type: 'biometric' as const,
        response: {
            clientDataJSON: clientDataJSONBase64,
            biometric: {
                publicKey,
                algorithm: -8 as const,
            },
        },
    };
}

async function processRegistration(params: RegistrationParams): Promise<ProcessResult> {
    if (!params.validateCode) {
        return {
            success: false,
            reason: VALUES.REASON.GENERIC.VALIDATE_CODE_MISSING,
        };
    }

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
        validateCode: Number(params.validateCode),
        authenticationMethod: params.authenticationMethod,
        publicKey: params.publicKey,
        currentPublicKeyIDs: params.currentPublicKeyIDs,
    });

    const success = String(httpCode).startsWith('2');

    return {
        success,
        reason,
    };
}

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
    const success = String(httpCode).startsWith('2');

    return {
        success,
        reason,
    };
}

export {processRegistration, processScenario};
export type {ProcessResult, RegistrationParams};

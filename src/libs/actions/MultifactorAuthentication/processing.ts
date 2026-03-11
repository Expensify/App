import type {MultifactorAuthenticationScenarioConfig} from '@components/MultifactorAuthentication/config/types';
import type {MarqetaAuthTypeName, MultifactorAuthenticationReason, RegistrationKeyInfo} from '@libs/MultifactorAuthentication/shared/types';
import VALUES from '@libs/MultifactorAuthentication/VALUES';
import {registerAuthenticationKey} from './index';

type ProcessResult = {
    success: boolean;
    reason: MultifactorAuthenticationReason;
    message?: string;
    httpStatusCode?: number;

    /** Optional response body containing scenario-specific data (e.g., {pin: number} for PIN reveal) */
    body?: Record<string, unknown>;
};

function isHttpSuccess(httpStatusCode: number | undefined): boolean {
    return String(httpStatusCode).startsWith('2');
}

type RegistrationParams = {
    keyInfo: RegistrationKeyInfo;
    authenticationMethod: MarqetaAuthTypeName;
};

async function processRegistration(params: RegistrationParams): Promise<ProcessResult> {
    const {httpStatusCode, reason, message} = await registerAuthenticationKey({
        keyInfo: params.keyInfo,
        authenticationMethod: params.authenticationMethod,
    });

    return {
        success: isHttpSuccess(httpStatusCode),
        reason,
        httpStatusCode,
        message,
    };
}

/**
 * Processes a multifactor authentication scenario action.
 * Executes the scenario-specific action with the signed challenge
 * and additional parameters. Returns success status and reason.
 *
 * @param action - The scenario's action function from the scenario config
 * @param params - Action parameters including signedChallenge and authenticationMethod
 * @returns Object with success status and reason
 */
async function processScenarioAction(
    action: MultifactorAuthenticationScenarioConfig['action'],
    params: Parameters<MultifactorAuthenticationScenarioConfig['action']>[0],
): Promise<ProcessResult> {
    if (!params.signedChallenge) {
        return {
            success: false,
            reason: VALUES.REASON.GENERIC.SIGNATURE_MISSING,
        };
    }

    const {httpStatusCode, reason, message, body} = await action(params);
    const success = isHttpSuccess(httpStatusCode);

    return {
        success,
        reason,
        httpStatusCode,
        message,
        body,
    };
}

export {processRegistration, processScenarioAction};
export type {ProcessResult, RegistrationParams};

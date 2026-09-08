import type {MultifactorAuthenticationScenarioConfigFor} from '@components/MultifactorAuthentication/config';
import type {
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioParameters,
    MultifactorAuthenticationScenarioParams,
    MultifactorAuthenticationScenarioResponse,
} from '@components/MultifactorAuthentication/config/types';

import type {SignedChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';
import {isHttpSuccess} from '@libs/MultifactorAuthentication/shared/helpers';
import {createMFAErrorFromApiResponse} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type {AuthTypeInfo, RegistrationKeyInfo} from '@libs/MultifactorAuthentication/shared/types';

import {registerAuthenticationKey} from './index';

type RegistrationParams = {
    keyInfo: RegistrationKeyInfo;
};

async function processRegistration(params: RegistrationParams): Promise<MFAResult> {
    const {httpStatusCode, reason, message} = await registerAuthenticationKey({
        keyInfo: params.keyInfo,
    });

    if (isHttpSuccess(httpStatusCode)) {
        return {success: true};
    }

    return {success: false, error: createMFAErrorFromApiResponse(httpStatusCode, reason, message)};
}

type ScenarioActionAuthenticationParams = {
    signedChallenge: SignedChallenge;
    authenticationMethod: AuthTypeInfo['marqetaValue'];
};

type RunScenarioAction = (authentication: ScenarioActionAuthenticationParams) => Promise<MFAResult<MultifactorAuthenticationScenarioResponse>>;

/** Normalizes a scenario API response into the result shape consumed by the machine. */
async function processScenarioAction(runAction: () => Promise<MultifactorAuthenticationScenarioResponse>): Promise<MFAResult<MultifactorAuthenticationScenarioResponse>> {
    const {httpStatusCode, reason, message, body} = await runAction();

    if (isHttpSuccess(httpStatusCode)) {
        return {
            success: true,
            httpStatusCode,
            reason,
            message,
            body,
        };
    }

    return {success: false, error: createMFAErrorFromApiResponse(httpStatusCode, reason, message)};
}

/**
 * Binds one scenario's action to its own payload while the scenario generic is still known. The
 * authorization path receives only the resulting runner, so action and payload cannot later drift
 * into an invalid cross-scenario pair.
 */
function createScenarioActionRunner<T extends MultifactorAuthenticationScenario>(
    _scenarioName: T,
    action: MultifactorAuthenticationScenarioConfigFor<NoInfer<T>>['action'],
    payload: MultifactorAuthenticationScenarioParams<NoInfer<T>> | undefined,
): RunScenarioAction {
    return (authentication) => {
        // The public payload may contain optional authentication fields, so actor-owned ceremony data
        // is spread last. TypeScript cannot normalize this generic intersection after object spread.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const actionParams = {...payload, ...authentication} as MultifactorAuthenticationScenarioParameters[T];
        // The scenario name fixes T before action and payload are accepted. This assertion only works
        // around TypeScript's inability to call an indexed generic function; the returned runner keeps
        // the already-validated pair closed over and exposes no action/payload inputs to the machine.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const boundAction = action as (params: MultifactorAuthenticationScenarioParameters[T]) => Promise<MultifactorAuthenticationScenarioResponse>;
        return processScenarioAction(() => boundAction(actionParams));
    };
}

export {createScenarioActionRunner, processRegistration, processScenarioAction};
export type {RunScenarioAction};

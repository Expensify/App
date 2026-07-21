import type {MultifactorAuthenticationScenarioResponse} from '@components/MultifactorAuthentication/config/types';

import type {AuthenticationChallenge, RegistrationChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';
import type {AuthTypeInfo} from '@libs/MultifactorAuthentication/shared/types';

/**
 * The reducer's MFA state shape: the fields not yet migrated to the state machine. Migrated fields
 * live in the machine context (`MfaContext`); the machine side is exposed to consumers as `MfaState`
 * via `snapshotToState`.
 */
type MultifactorAuthenticationState = {
    /** Challenge received from backend for registration (full object with user, rp, challenge) */
    registrationChallenge: RegistrationChallenge | undefined;

    /** Challenge received from backend for authorization (full object with allowCredentials, rpId, challenge) */
    authorizationChallenge: AuthenticationChallenge | undefined;

    /** Whether registration step has been completed */
    isRegistrationComplete: boolean;

    /** Whether authorization step has been completed */
    isAuthorizationComplete: boolean;

    /** Whether the entire flow has been completed */
    isFlowComplete: boolean;

    /** Authentication method used (e.g., 'BIOMETRIC_FACE', 'BIOMETRIC_FINGERPRINT') */
    authenticationMethod: AuthTypeInfo | undefined;

    /** Response from the scenario API call, stored for callback invocation at outcome navigation */
    scenarioResponse: MultifactorAuthenticationScenarioResponse | undefined;
};

const DEFAULT_STATE: MultifactorAuthenticationState = {
    registrationChallenge: undefined,
    authorizationChallenge: undefined,
    isRegistrationComplete: false,
    isAuthorizationComplete: false,
    isFlowComplete: false,
    authenticationMethod: undefined,
    scenarioResponse: undefined,
};

export type {MultifactorAuthenticationState};
export {DEFAULT_STATE};

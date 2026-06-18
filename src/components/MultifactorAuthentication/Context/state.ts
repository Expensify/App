import type {MultifactorAuthenticationScenarioResponse} from '@components/MultifactorAuthentication/config/types';
import type {AuthenticationChallenge, RegistrationChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';
import type {MFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type {AuthTypeInfo} from '@libs/MultifactorAuthentication/shared/types';

/**
 * The reducer's MFA state shape: the fields not yet migrated to the state machine. Migrated fields
 * live in the machine context (`MfaContext`); the machine side is exposed to consumers as `MfaState`
 * via `snapshotToState`.
 */
type MultifactorAuthenticationState = {
    /** Continuable error - displayed on current screen without stopping the flow */
    continuableError: MFAError | undefined;

    /** Validate code entered by user */
    validateCode: string | undefined;

    /** Challenge received from backend for registration (full object with user, rp, challenge) */
    registrationChallenge: RegistrationChallenge | undefined;

    /** Challenge received from backend for authorization (full object with allowCredentials, rpId, challenge) */
    authorizationChallenge: AuthenticationChallenge | undefined;

    /** Whether user approved the soft prompt for biometric setup */
    softPromptApproved: boolean;

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
    continuableError: undefined,
    validateCode: undefined,
    registrationChallenge: undefined,
    authorizationChallenge: undefined,
    softPromptApproved: false,
    isRegistrationComplete: false,
    isAuthorizationComplete: false,
    isFlowComplete: false,
    authenticationMethod: undefined,
    scenarioResponse: undefined,
};

export type {MultifactorAuthenticationState};
export {DEFAULT_STATE};

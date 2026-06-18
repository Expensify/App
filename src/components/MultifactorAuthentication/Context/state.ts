import type {MultifactorAuthenticationScenarioConfigFor} from '@components/MultifactorAuthentication/config';
import type {
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioResponse,
} from '@components/MultifactorAuthentication/config/types';
import type {AuthenticationChallenge, RegistrationChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';
import type {MFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type {AuthTypeInfo} from '@libs/MultifactorAuthentication/shared/types';

/**
 * The full MFA state shape. During the reducer-to-machine migration it is the single definition both
 * layers build on, so the field set is not forked: the reducer (`stateReducer`) uses it directly and
 * owns the fields not yet moved to the machine, while the machine derives its context (`MfaContext`)
 * as a `Pick` of it, without importing the reducer. Consumers read the machine side through the
 * narrower `MfaState` (that `Pick` plus `modalState`) via `snapshotToState`, not this full shape.
 */
type MultifactorAuthenticationState = {
    /** Current error state - stops the flow and navigates to failure outcome */
    error: MFAError | undefined;

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

    /** Scenario name identifier (e.g. 'AUTHORIZE-TRANSACTION') */
    scenarioName: MultifactorAuthenticationScenario | undefined;

    /** Current scenario configuration being executed */
    scenario: MultifactorAuthenticationScenarioConfigFor<MultifactorAuthenticationScenario> | undefined;

    /** Additional parameters for the current scenario */
    payload: MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined;

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

    /** Whether the cancel-confirmation modal triggered by a back press is currently visible */
    isCancelConfirmVisible: boolean;
};

const DEFAULT_STATE: MultifactorAuthenticationState = {
    error: undefined,
    continuableError: undefined,
    validateCode: undefined,
    registrationChallenge: undefined,
    authorizationChallenge: undefined,
    softPromptApproved: false,
    scenarioName: undefined,
    scenario: undefined,
    payload: undefined,
    isRegistrationComplete: false,
    isAuthorizationComplete: false,
    isFlowComplete: false,
    authenticationMethod: undefined,
    scenarioResponse: undefined,
    isCancelConfirmVisible: false,
};

export type {MultifactorAuthenticationState};
export {DEFAULT_STATE};

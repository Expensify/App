import type {
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioConfig,
    MultifactorAuthenticationScenarioResponse,
} from '@components/MultifactorAuthentication/config/types';
import type {AuthenticationChallenge, RegistrationChallenge} from '@libs/MultifactorAuthentication/Biometrics/ED25519/types';
import type {AuthTypeInfo, MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/Biometrics/types';

type ErrorState = {
    reason: MultifactorAuthenticationReason;
    httpStatusCode?: number;
    message?: string;
};

type MultifactorAuthenticationState = {
    /** Current error state - stops the flow and navigates to failure outcome */
    error: ErrorState | undefined;

    /** Continuable error - displayed on current screen without stopping the flow */
    continuableError: ErrorState | undefined;

    /** Validate code entered by user */
    validateCode: string | undefined;

    /** Challenge received from backend for registration (full object with user, rp, challenge) */
    registrationChallenge: RegistrationChallenge | undefined;

    /** Challenge received from backend for authorization (full object with allowCredentials, rpId, challenge) */
    authorizationChallenge: AuthenticationChallenge | undefined;

    /** Whether user approved the soft prompt for biometric setup */
    softPromptApproved: boolean;

    /** Current scenario configuration being executed */
    scenario: MultifactorAuthenticationScenarioConfig | undefined;

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
};

type InitPayload = {
    scenario: MultifactorAuthenticationScenario;
    payload: MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined;
};

type Action =
    | {type: 'SET_ERROR'; payload: ErrorState | undefined}
    | {type: 'CLEAR_CONTINUABLE_ERROR'}
    | {type: 'SET_VALIDATE_CODE'; payload: string | undefined}
    | {type: 'SET_REGISTRATION_CHALLENGE'; payload: RegistrationChallenge | undefined}
    | {type: 'SET_AUTHORIZATION_CHALLENGE'; payload: AuthenticationChallenge | undefined}
    | {type: 'SET_SOFT_PROMPT_APPROVED'; payload: boolean}
    | {type: 'SET_SCENARIO'; payload: MultifactorAuthenticationScenarioConfig | undefined}
    | {type: 'SET_PAYLOAD'; payload: MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined}
    | {type: 'SET_REGISTRATION_COMPLETE'; payload: boolean}
    | {type: 'SET_AUTHORIZATION_COMPLETE'; payload: boolean}
    | {type: 'SET_FLOW_COMPLETE'; payload: boolean}
    | {type: 'SET_AUTHENTICATION_METHOD'; payload: AuthTypeInfo | undefined}
    | {type: 'SET_SCENARIO_RESPONSE'; payload: MultifactorAuthenticationScenarioResponse | undefined}
    | {type: 'INIT'; payload: InitPayload}
    | {type: 'REREGISTER'}
    | {type: 'RESET'};

/** Context value for state - the current MFA state */
type MultifactorAuthenticationStateContextType = MultifactorAuthenticationState;

/** Context value for actions - dispatch to update state */
type MultifactorAuthenticationActionsContextType = {
    dispatch: (action: Action) => void;
};

export type {ErrorState, MultifactorAuthenticationState, InitPayload, Action, MultifactorAuthenticationStateContextType, MultifactorAuthenticationActionsContextType};

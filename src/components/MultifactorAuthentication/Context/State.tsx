import React, {createContext, useContext, useMemo, useReducer} from 'react';
import type {ReactNode} from 'react';
import {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from '@components/MultifactorAuthentication/config';
import type {
    MultifactorAuthenticationScenario,
    MultifactorAuthenticationScenarioAdditionalParams,
    MultifactorAuthenticationScenarioConfig,
    MultifactorAuthenticationScenarioResponse,
} from '@components/MultifactorAuthentication/config/types';
import type {AuthenticationChallenge, RegistrationChallenge} from '@libs/MultifactorAuthentication/Biometrics/ED25519/types';
import type {AuthTypeInfo, MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';

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

type MultifactorAuthenticationStateContextValue = {
    state: MultifactorAuthenticationState;
    dispatch: (action: Action) => void;
};

const DEFAULT_STATE: MultifactorAuthenticationState = {
    error: undefined,
    continuableError: undefined,
    validateCode: undefined,
    registrationChallenge: undefined,
    authorizationChallenge: undefined,
    softPromptApproved: false,
    scenario: undefined,
    payload: undefined,
    isRegistrationComplete: false,
    isAuthorizationComplete: false,
    isFlowComplete: false,
    authenticationMethod: undefined,
    scenarioResponse: undefined,
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

/**
 * Reducer function that manages the multifactor authentication state machine.
 * Handles all state transitions based on dispatched actions, including:
 * - Error handling (fatal errors and continuable errors like invalid codes)
 * - Challenge management (registration and authorization)
 * - Flow progression tracking
 * - Scenario and payload management
 *
 * @param state - The current state
 * @param action - The action to process with type-specific payload
 * @returns The new state after applying the action
 */
function stateReducer(state: MultifactorAuthenticationState, action: Action): MultifactorAuthenticationState {
    switch (action.type) {
        case 'SET_ERROR': {
            if (action.payload === undefined) {
                return {...state, error: undefined, continuableError: undefined};
            }
            // Invalid validate code is a continuable error - it doesn't fail the entire MFA flow,
            // instead it's displayed on the current screen and the user can retry
            if (action.payload.reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.INVALID_VALIDATE_CODE) {
                return {...state, continuableError: action.payload, error: undefined};
            }
            return {...state, error: action.payload, continuableError: undefined};
        }
        case 'CLEAR_CONTINUABLE_ERROR':
            return {...state, continuableError: undefined};
        case 'SET_VALIDATE_CODE':
            return {...state, validateCode: action.payload};
        case 'SET_REGISTRATION_CHALLENGE':
            return {...state, registrationChallenge: action.payload};
        case 'SET_AUTHORIZATION_CHALLENGE':
            return {...state, authorizationChallenge: action.payload};
        case 'SET_SOFT_PROMPT_APPROVED':
            return {...state, softPromptApproved: action.payload};
        case 'SET_SCENARIO':
            return {...state, scenario: action.payload};
        case 'SET_PAYLOAD':
            return {...state, payload: action.payload};
        case 'SET_REGISTRATION_COMPLETE':
            return {...state, isRegistrationComplete: action.payload};
        case 'SET_AUTHORIZATION_COMPLETE':
            return {...state, isAuthorizationComplete: action.payload};
        case 'SET_FLOW_COMPLETE':
            return {...state, isFlowComplete: action.payload};
        case 'SET_AUTHENTICATION_METHOD':
            return {...state, authenticationMethod: action.payload};
        case 'SET_SCENARIO_RESPONSE':
            return {...state, scenarioResponse: action.payload};
        case 'INIT':
            return {
                ...DEFAULT_STATE,
                scenario: MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[action.payload.scenario],
                payload: action.payload.payload,
            };
        case 'RESET':
            return DEFAULT_STATE;
        case 'REREGISTER':
            return {
                ...DEFAULT_STATE,
                scenario: state.scenario,
                payload: state.payload,
            };
        default:
            return state;
    }
}

const MultifactorAuthenticationStateContext = createContext<MultifactorAuthenticationStateContextValue | undefined>(undefined);

type MultifactorAuthenticationStateProviderProps = {
    children: ReactNode;
};

/**
 * Provider component that manages the global multifactor authentication state.
 * Uses a reducer pattern to handle complex state transitions and provides
 * the state and dispatch function to all consuming components.
 * Must be placed high in the component tree to wrap all MFA-related screens.
 *
 * @param props - Component props
 * @param props.children - Child components that will have access to MFA state
 * @returns The provider component wrapping children
 */
function MultifactorAuthenticationStateProvider({children}: MultifactorAuthenticationStateProviderProps) {
    const [state, dispatch] = useReducer(stateReducer, DEFAULT_STATE);

    const contextValue: MultifactorAuthenticationStateContextValue = useMemo(
        () => ({
            state,
            dispatch,
        }),
        [state],
    );

    return <MultifactorAuthenticationStateContext.Provider value={contextValue}>{children}</MultifactorAuthenticationStateContext.Provider>;
}

/**
 * Hook to access the multifactor authentication state and dispatch function.
 * Provides access to the current state and a dispatch function for triggering state updates.
 * Must be called within a MultifactorAuthenticationStateProvider tree.
 *
 * @returns Object containing:
 *   - state: The current MultifactorAuthenticationState
 *   - dispatch: Function to dispatch actions and update state
 * @throws {Error} If used outside of MultifactorAuthenticationStateProvider
 *
 * @example
 * const {state, dispatch} = useMultifactorAuthenticationState();
 * dispatch({type: 'SET_VALIDATE_CODE', payload: '123456'});
 */
function useMultifactorAuthenticationState(): MultifactorAuthenticationStateContextValue {
    const context = useContext(MultifactorAuthenticationStateContext);

    if (!context) {
        throw new Error('useMultifactorAuthenticationState must be used within a MultifactorAuthenticationStateProvider');
    }

    return context;
}

MultifactorAuthenticationStateProvider.displayName = 'MultifactorAuthenticationStateProvider';

export default MultifactorAuthenticationStateProvider;
export {useMultifactorAuthenticationState, MultifactorAuthenticationStateContext, DEFAULT_STATE};
export type {MultifactorAuthenticationState, MultifactorAuthenticationStateContextValue, ErrorState, Action};

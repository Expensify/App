import {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from '@components/MultifactorAuthentication/config';
import CONST from '@src/CONST';
import type {Action, MultifactorAuthenticationState} from './types';

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

export {DEFAULT_STATE, stateReducer};

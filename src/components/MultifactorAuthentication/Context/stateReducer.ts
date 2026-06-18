import CONST from '@src/CONST';
import {DEFAULT_STATE} from './state';
import type {Action, MultifactorAuthenticationState} from './types';

/**
 * Reducer for the MFA fields the state machine has not taken over yet.
 */
function stateReducer(state: MultifactorAuthenticationState, action: Action): MultifactorAuthenticationState {
    switch (action.type) {
        case 'SET_ERROR': {
            // Only a continuable error (an invalid validate code) belongs to the reducer; a fatal error
            // stops the flow and is owned by the machine, so anything else just clears the continuable one.
            if (action.payload?.reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.CLIENT_ERRORS.INVALID_VALIDATE_CODE) {
                return {...state, continuableError: action.payload};
            }
            return {...state, continuableError: undefined};
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
        case 'RESET':
            return DEFAULT_STATE;
        default:
            return state;
    }
}

export {DEFAULT_STATE, stateReducer};

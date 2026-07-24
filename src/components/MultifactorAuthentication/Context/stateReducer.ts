import type {Action, MultifactorAuthenticationState} from './types';

import {DEFAULT_STATE} from './state';

/**
 * Reducer for the MFA fields the state machine has not taken over yet.
 */
function stateReducer(state: MultifactorAuthenticationState, action: Action): MultifactorAuthenticationState {
    switch (action.type) {
        case 'SET_AUTHORIZATION_CHALLENGE':
            return {...state, authorizationChallenge: action.payload};
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

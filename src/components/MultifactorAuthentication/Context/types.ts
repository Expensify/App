import type {MultifactorAuthenticationScenarioResponse} from '@components/MultifactorAuthentication/config/types';
import type {AuthenticationChallenge, RegistrationChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';
import type {MFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type {AuthTypeInfo} from '@libs/MultifactorAuthentication/shared/types';
import type {MultifactorAuthenticationState} from './state';

type Action =
    | {type: 'SET_ERROR'; payload: MFAError | undefined}
    | {type: 'CLEAR_CONTINUABLE_ERROR'}
    | {type: 'SET_VALIDATE_CODE'; payload: string | undefined}
    | {type: 'SET_REGISTRATION_CHALLENGE'; payload: RegistrationChallenge | undefined}
    | {type: 'SET_AUTHORIZATION_CHALLENGE'; payload: AuthenticationChallenge | undefined}
    | {type: 'SET_SOFT_PROMPT_APPROVED'; payload: boolean}
    | {type: 'SET_REGISTRATION_COMPLETE'; payload: boolean}
    | {type: 'SET_AUTHORIZATION_COMPLETE'; payload: boolean}
    | {type: 'SET_FLOW_COMPLETE'; payload: boolean}
    | {type: 'SET_AUTHENTICATION_METHOD'; payload: AuthTypeInfo | undefined}
    | {type: 'SET_SCENARIO_RESPONSE'; payload: MultifactorAuthenticationScenarioResponse | undefined}
    | {type: 'RESET'};

/** Context value for state - the current MFA state */
type MultifactorAuthenticationStateContextType = MultifactorAuthenticationState;

/** Context value for actions - dispatch to update state */
type MultifactorAuthenticationActionsContextType = {
    dispatch: (action: Action) => void;
};

export type {MultifactorAuthenticationState, Action, MultifactorAuthenticationStateContextType, MultifactorAuthenticationActionsContextType};

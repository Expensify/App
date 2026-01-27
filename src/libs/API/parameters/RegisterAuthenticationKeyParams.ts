import type {MultifactorAuthenticationScenarioParameters} from '@components/MultifactorAuthentication/config/types';

/**
 * The keyInfo type is changed because we want to validate the structure when the action is called,
 * but it needs to be stringified when sent to the API.
 */

type RegisterAuthenticationKeyParams = Omit<MultifactorAuthenticationScenarioParameters['REGISTER-BIOMETRICS'], 'keyInfo'> & {
    keyInfo: string;
};

export default RegisterAuthenticationKeyParams;

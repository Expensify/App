import type {MultifactorAuthenticationScenarioParameters} from '@components/MultifactorAuthentication/config/types';

/**
 * The signedChallenge type is changed because we want to validate the structure when the action is called,
 * but it needs to be stringified when sent to the API.
 */
type TroubleshootMultifactorAuthenticationParams = Omit<MultifactorAuthenticationScenarioParameters['BIOMETRICS-TEST'], 'signedChallenge'> & {
    signedChallenge: string;
};

export default TroubleshootMultifactorAuthenticationParams;

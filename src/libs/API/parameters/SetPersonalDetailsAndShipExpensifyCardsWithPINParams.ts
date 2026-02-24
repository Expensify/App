import type {MultifactorAuthenticationScenarioParameters} from '@components/MultifactorAuthentication/config/types';

type SetPersonalDetailsAndShipExpensifyCardsWithPINParams = Omit<MultifactorAuthenticationScenarioParameters['SET-PIN-ORDER-CARD'], 'signedChallenge'> & {
    signedChallenge: string;
};

export default SetPersonalDetailsAndShipExpensifyCardsWithPINParams;

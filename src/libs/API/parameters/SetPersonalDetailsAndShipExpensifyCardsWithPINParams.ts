import type SetPersonalDetailsAndShipExpensifyCardsParams from './SetPersonalDetailsAndShipExpensifyCardsParams';

type SetPersonalDetailsAndShipExpensifyCardsWithPINParams = SetPersonalDetailsAndShipExpensifyCardsParams & {
    pin: string;
    signedChallenge?: string;
};

export default SetPersonalDetailsAndShipExpensifyCardsWithPINParams;

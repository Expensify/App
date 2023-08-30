type FraudState = 'none' | 'domain' | 'individual';
type State =
3 /* OPEN */ |
4 /* NOT_ACTIVATED */ |
5 /* STATE_DEACTIVATED */ |
6 /* CLOSED */ |
7 /* STATE_SUSPENDED */;

type Card = {
    cardID: number,
    isVirtual: boolean,
    domainName: string,
    cardholderFirstName: string,
    cardholderLastName: string,
    fraud: FraudState,
    bank: string,
    state: State,
    availableSpend: number,
    maskedPan: string,
};

export default Card;

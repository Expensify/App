import {ValueOf} from 'type-fest';
import CONST from '../../CONST';

type State = 3 /* OPEN */ | 4 /* NOT_ACTIVATED */ | 5 /* STATE_DEACTIVATED */ | 6 /* CLOSED */ | 7 /* STATE_SUSPENDED */;

type Card = {
    cardID: number;
    state: State;
    bank: string;
    availableSpend: number;
    domainName: string;
    maskedPan: string;
    isVirtual: boolean;
    fraud: ValueOf<typeof CONST.EXPENSIFY_CARD.FRAUD_TYPES>;
    cardholderFirstName: string;
    cardholderLastName: string;
};

export default Card;

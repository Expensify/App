import {ValueOf} from 'type-fest';
import CONST from '../../CONST';
import * as OnyxCommon from './OnyxCommon';

type State = 3 /* OPEN */ | 4 /* NOT_ACTIVATED */ | 5 /* STATE_DEACTIVATED */ | 6 /* CLOSED */ | 7 /* STATE_SUSPENDED */;

type Card = {
    cardID: number;
    state: State;
    bank: string;
    availableSpend: number;
    domainName: string;
    maskedPan?: string; // do not reference, removing as part of Expensify/App#27943
    lastFourPAN?: string;
    cardName: string;
    isVirtual: boolean;
    fraud: ValueOf<typeof CONST.EXPENSIFY_CARD.FRAUD_TYPES>;
    cardholderFirstName: string;
    cardholderLastName: string;
    errors?: OnyxCommon.Errors;
};

export default Card;

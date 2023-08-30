import {ValueOf} from 'type-fest';
import CONST from '../../CONST';

type Fund = {
    cardID?: number;
    state?: number;
    bank?: string;
    availableSpend?: number;
    domainName?: string;
    maskedPan?: string;
    isVirtual?: boolean;
    fraud?: ValueOf<typeof CONST.EXPENSIFY_CARD.FRAUD_TYPES>;
    cardholderFirstName?: string,
    cardholderLastName?: string,
};

export default Fund;
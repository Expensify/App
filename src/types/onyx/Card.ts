import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import * as OnyxCommon from './OnyxCommon';

type Card = {
    cardID: number;
    state: ValueOf<typeof CONST.EXPENSIFY_CARD.STATE>;
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
    isLoading?: boolean;
};

type TCardDetails = {
    pan: string;
    expiration: string;
    cvv: string;
    address: {
        street: string;
        street2: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
};

export default Card;
export type {TCardDetails};

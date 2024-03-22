import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';

type Card = {
    cardID: number;
    state: ValueOf<typeof CONST.EXPENSIFY_CARD.STATE>;
    bank: string;
    availableSpend: number;
    domainName: string;
    lastFourPAN?: string;
    isVirtual: boolean;
    fraud: ValueOf<typeof CONST.EXPENSIFY_CARD.FRAUD_TYPES>;
    cardholderFirstName: string;
    cardholderLastName: string;
    errors?: OnyxCommon.Errors;
    isLoading?: boolean;
    nameValuePairs?: {
        limitType?: ValueOf<typeof CONST.EXPENSIFY_CARD.LIMIT_TYPES>;
        cardTitle?: string; // used only for virtual limit cards
        issuedBy?: string;
    }
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

type CardList = Record<string, Card>;

export default Card;
export type {TCardDetails, CardList};

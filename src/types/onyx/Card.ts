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
    fraud: ValueOf<typeof CONST.EXPENSIFY_CARD.FRAUD_TYPES>;
    errors?: OnyxCommon.Errors;
    isLoading?: boolean;
    nameValuePairs?: {
        limitType?: ValueOf<typeof CONST.EXPENSIFY_CARD.LIMIT_TYPES>;
        cardTitle?: string; // Used only for admin-issued virtual cards
        issuedBy?: number;
        hasCustomUnapprovedExpenseLimit?: boolean;
        unapprovedExpenseLimit?: number;
        feedCountry?: string;
        isVirtual?: boolean;
        previousState?: number;
        expirationDate?: string;
    };
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

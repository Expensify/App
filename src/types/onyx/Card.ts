import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';

/** Model of expensify card */
type Card = {
    /** Card ID number */
    cardID: number;

    /** Current card state */
    state: ValueOf<typeof CONST.EXPENSIFY_CARD.STATE>;

    /** Bank name */
    bank: string;

    /** Available amount to spend */
    availableSpend: number;

    /** Domain name */
    domainName: string;

    /** Last four Primary Account Number digits */
    lastFourPAN?: string;

    /** Determines if the current card was flagged as fraud */
    fraud: ValueOf<typeof CONST.EXPENSIFY_CARD.FRAUD_TYPES>;

    /** Card related error messages */
    errors?: OnyxCommon.Errors;

    /** Is card data loading */
    isLoading?: boolean;

    /** Additional card data */
    nameValuePairs?: {
        // TODO: Doesn't seem to be used in app
        /** Type of spending limits  */
        limitType?: ValueOf<typeof CONST.EXPENSIFY_CARD.LIMIT_TYPES>;

        // TODO: Doesn't seem to be used in app
        cardTitle?: string; // Used only for admin-issued virtual cards

        // TODO: Doesn't seem to be used in app
        issuedBy?: number;

        // TODO: Doesn't seem to be used in app
        hasCustomUnapprovedExpenseLimit?: boolean;

        // TODO: Doesn't seem to be used in app
        unapprovedExpenseLimit?: number;

        // TODO: Doesn't seem to be used in app
        feedCountry?: string;

        /** Is a virtual card */
        isVirtual?: boolean;

        // TODO: Doesn't seem to be used in app
        previousState?: number;

        // TODO: Doesn't seem to be used in app
        /** Card expiration date */
        expirationDate?: string;
    };
};

/** Model of expensify card details */
type TCardDetails = {
    /** Card Primary Account Number */
    pan: string;

    /** Card expiration date */
    expiration: string;

    /** Card Verification Value number */
    cvv: string;

    // TODO: Doesn't seem to be used in app
    /** Card owner address */
    address: {
        /** Address line 1 */
        street: string;

        /** Address line 2 */
        street2: string;

        /** City */
        city: string;

        /** State */
        state: string;

        /** Zip code */
        zip: string;

        /** Country */
        country: string;
    };
};

/** Record of expensify cards, indexed by cardID */
type CardList = Record<string, Card>;

export default Card;
export type {TCardDetails, CardList};

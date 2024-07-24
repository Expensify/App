import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';

/** Model of Expensify card */
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

    /** Current fraud state of the card */
    fraud: ValueOf<typeof CONST.EXPENSIFY_CARD.FRAUD_TYPES>;

    /** Card related error messages */
    errors?: OnyxCommon.Errors;

    /** Is card data loading */
    isLoading?: boolean;

    /** Cardholder account ID */
    accountID?: number;

    /** Additional card data */
    nameValuePairs?: {
        /** Type of card spending limits */
        limitType?: ValueOf<typeof CONST.EXPENSIFY_CARD.LIMIT_TYPES>;

        /** Card spending limit */
        limit?: number;

        /** User-defined nickname for the card */
        cardTitle?: string;

        /** Account ID of user that issued the card */
        issuedBy?: number;

        /**
         * Whether the card has a custom unapproved expense limit.
         * When not set, the domain unapproved expense limit is used
         */
        hasCustomUnapprovedExpenseLimit?: boolean;

        /**
         * The maximum unapproved spend allowed on the card.
         * If it's $100 and you spend $100, you need to get the expenses approved for the card to continue working
         */
        unapprovedExpenseLimit?: number;

        /** Card product under which the card is provisioned */
        feedCountry?: string;

        /** Is a virtual card */
        isVirtual?: boolean;

        /** Previous card state */
        previousState?: number;

        /** Card expiration date */
        expirationDate?: string;
    };
};

/** Model of Expensify card details */
type ExpensifyCardDetails = {
    /** Card Primary Account Number */
    pan: string;

    /** Card expiration date */
    expiration: string;

    /** Card Verification Value number */
    cvv: string;
};

/** Record of Expensify cards, indexed by cardID */
type CardList = Record<string, Card>;

/** Issue new card flow steps */
type IssueNewCardStep = ValueOf<typeof CONST.EXPENSIFY_CARD.STEP>;

/** Data required to be sent to issue a new card */
type IssueNewCardData = {
    /** The email address of the cardholder */
    assigneeEmail: string;

    /** Card type */
    cardType: ValueOf<typeof CONST.EXPENSIFY_CARD.CARD_TYPE>;

    /** Card spending limit type */
    limitType: ValueOf<typeof CONST.EXPENSIFY_CARD.LIMIT_TYPES>;

    /** Card spending limit */
    limit: number;

    /** Name of the card */
    cardTitle: string;
};

/** Model of Issue new card flow */
type IssueNewCard = {
    /** The current step of the flow */
    currentStep: IssueNewCardStep;

    /** Data required to be sent to issue a new card */
    data: IssueNewCardData;

    /** Whether the user is editing step */
    isEditing: boolean;
};

/** List of Expensify cards */
type WorkspaceCardsList = Record<string, Card>;

export default Card;
export type {ExpensifyCardDetails, CardList, IssueNewCard, IssueNewCardStep, IssueNewCardData, WorkspaceCardsList};

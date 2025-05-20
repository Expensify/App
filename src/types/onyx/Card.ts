import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';

/** Model of Expensify card */
type Card = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Card ID number */
    cardID: number;

    /** Current card state */
    state: ValueOf<typeof CONST.EXPENSIFY_CARD.STATE>;

    /** Bank name */
    bank: string;

    /** Available amount to spend */
    availableSpend?: number;

    /** Spend that is unapproved on the card (comes as a negative number) */
    unapprovedSpend?: number;

    /** Total spend on the card (comes as a negative number) */
    totalSpend?: number;

    /** Domain name */
    domainName: string;

    /** Transaction start date */
    startDate?: Date;

    /** The last time user checked the card for transactions */
    lastUpdated: string;

    /** Is checking for card transactions */
    isLoadingLastUpdated?: boolean;

    /** Last four Primary Account Number digits */
    lastFourPAN?: string;

    /** Card number */
    cardNumber?: string;

    /** Current fraud state of the card */
    fraud: ValueOf<typeof CONST.EXPENSIFY_CARD.FRAUD_TYPES>;

    /** Card name */
    cardName?: string;

    /** Related policy account id */
    fundID?: string;

    /** Transaction start date */
    scrapeMinDate?: string;

    /** Last updated time */
    lastScrape?: string;

    /** Last update result */
    lastScrapeResult?: number;

    /** Card related error messages */
    errors?: OnyxCommon.Errors;

    /** Collection of form field errors  */
    errorFields?: OnyxCommon.ErrorFields;

    /** Is card data loading */
    isLoading?: boolean;

    /** Cardholder account ID */
    accountID?: number;

    /** Card's primary account identifier token */
    token?: string;

    /** Additional card data */
    nameValuePairs?: OnyxCommon.OnyxValueWithOfflineFeedback<{
        /** Type of card spending limits */
        limitType?: ValueOf<typeof CONST.EXPENSIFY_CARD.LIMIT_TYPES>;

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

        /** Is a travel card */
        isTravelCard?: boolean;

        /** Previous card state */
        previousState?: number;

        /** Card expiration date */
        expirationDate?: string;

        /** List of token reference ids */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        expensifyCard_tokenReferenceIdList?: string[];

        /** Collection of errors coming from BE */
        errors?: OnyxCommon.Errors;

        /** Collection of form field errors  */
        errorFields?: OnyxCommon.ErrorFields;
    }> &
        OnyxCommon.OnyxValueWithOfflineFeedback<{
            /** Type of export card */
            [key in ValueOf<typeof CONST.COMPANY_CARDS.EXPORT_CARD_TYPES> | ValueOf<typeof CONST.COMPANY_CARDS.EXPORT_CARD_POLICY_TYPES>]: string;
        }>;
}>;

/** Model of card just added to a wallet */
type ProvisioningCardData = {
    /** Card identifier */
    cardToken: string;

    /** Card display name */
    displayName: string;

    /** Last 4 digits of the card */
    lastDigits: string;

    /** Name of a payment card network e.g. visa */
    network: string;

    /** Binary blob of information Google Pay receives from the issuer app that could be presented to TSP to receive a token */
    opaquePaymentCard: string;

    /** Service that enhances payment security by replacing a credit card number during transactions with a unique digital identifier - token. */
    tokenServiceProvider: string;

    /** Whether the request is being processed */
    isLoading?: boolean;

    /** Error message */
    errors?: OnyxCommon.Errors;

    /** User's address, required to add card to wallet */
    userAddress: {
        /** Name of card holder */
        name: string;

        /** Phone numer of card holder */
        phone: string;

        /** First line of address */
        address1: string;

        /** Optionally second line of address */
        address2?: string;

        /** Card holder's city of living */
        city: string;

        /** Postal code of the city */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        postal_code: string;

        /** Card holder's state of living */
        state: string;

        /** Card holder's country of living */
        country: string;
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

/** Card spending limit type */
type CardLimitType = ValueOf<typeof CONST.EXPENSIFY_CARD.LIMIT_TYPES>;

/** Data required to be sent to issue a new card */
type IssueNewCardData = {
    /** The email address of the cardholder */
    assigneeEmail: string;

    /** Card type */
    cardType: ValueOf<typeof CONST.EXPENSIFY_CARD.CARD_TYPE>;

    /** Card spending limit type */
    limitType: CardLimitType;

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

    /** Whether the request is being processed */
    isLoading?: boolean;

    /** Error message */
    errors?: OnyxCommon.Errors;

    /** Whether the request was successful */
    isSuccessful?: boolean;
};

/** List of Expensify cards */
type WorkspaceCardsList = Record<string, Card> & {
    /** List of cards to assign */
    cardList?: Record<string, string>;
};

/** Card list with only available card */
type FilteredCardList = Record<string, string>;

export default Card;
export type {ExpensifyCardDetails, CardList, IssueNewCard, IssueNewCardStep, IssueNewCardData, WorkspaceCardsList, CardLimitType, FilteredCardList, ProvisioningCardData};

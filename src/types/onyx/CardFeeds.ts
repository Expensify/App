import type {LinkAccount} from 'react-native-plaid-link-sdk';
import type {PlaidAccount} from 'react-plaid-link';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';

/** Card feed */
type CompanyCardFeed = ValueOf<typeof CONST.COMPANY_CARD.FEED_BANK_NAME>;

/** Company card feed with domain ID */
type CompanyCardFeedWithDomainID = `${CompanyCardFeed}${typeof CONST.COMPANY_CARD.FEED_KEY_SEPARATOR}${string}`;

/** Custom card feed with a number */
type CompanyCardFeedWithNumber = CompanyCardFeed | `${CompanyCardFeed}${number}` | CompanyCardFeedWithDomainID;

/** Statement period end */
type StatementPeriodEnd = Exclude<ValueOf<typeof CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE>, typeof CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH>;

/** Statement period end day */
type StatementPeriodEndDay = number;

/** Card feed provider */
type CardFeedProvider =
    | typeof CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD
    | typeof CONST.COMPANY_CARD.FEED_BANK_NAME.VISA
    | typeof CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX
    | typeof CONST.COMPANY_CARD.FEED_BANK_NAME.STRIPE;

/** Card feed details */
type CardFeedDetails = {
    /** Processor ID */
    processorID?: string;

    /** Financial institution (bank) ID */
    bankID?: string;

    /** Financial institution (bank) name */
    bankName?: string;

    /** Company ID */
    companyID?: string;

    /** Distribution ID */
    distributionID?: string;

    /** Delivery file name */
    deliveryFileName?: string;
};

/** Custom card feed data */
type CustomCardFeedData = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Whether any actions are pending */
    pending?: boolean;

    /** Determines if Automated Statement Reconciliation (ASR) is enabled for the cards */
    asrEnabled?: boolean;

    /** Specifies if the expenses on this card should be force reimbursable */
    forceReimbursable?: string;

    /** Defines the type of liability for the card */
    liabilityType?: string;

    /** Preferred policy */
    preferredPolicy?: string;

    /** Country associated with this feed (ISO 3166-1 alpha-2 code) */
    country?: string;

    /** The id of the domain the feed relates to */
    domainID?: number;

    /** Specifies the format for the report title related to this card */
    reportTitleFormat?: string;

    /** Indicates the day when the statement period for this card ends.
     * The BE returns a unified key which may hold either a preset value (string) or a custom day (integer)
     */
    statementPeriodEndDay?: StatementPeriodEnd | StatementPeriodEndDay;

    /** Plaid access token */
    plaidAccessToken?: string;

    /** Field-specific error messages */
    errorFields?: OnyxCommon.ErrorFields<'statementPeriodEndDay'>;

    /**
     * Collection of errors coming from BE
     */
    errors?: OnyxCommon.Errors;
}>;

/** Direct card feed data */
type DirectCardFeedData = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** List of accounts */
    accountList: string[];

    /** Credentials info */
    credentials: string;

    /** Expiration number */
    expiration: number;

    /** Defines the type of liability for the card */
    liabilityType?: string;

    /** The id of the domain the feed relates to */
    domainID?: number;

    /** Whether any actions are pending */
    pending?: boolean;

    /** Indicates the day when the statement period for this card ends.
     * The BE returns a unified key which may hold either a preset value (string) or a custom day (integer)
     */
    statementPeriodEndDay?: StatementPeriodEnd | StatementPeriodEndDay;

    /** Plaid access token */
    plaidAccessToken?: string;

    /** Field-specific error messages */
    errorFields?: OnyxCommon.ErrorFields<'statementPeriodEndDay'>;

    /**
     * Collection of errors coming from BE
     */
    errors?: OnyxCommon.Errors;
}>;

/** Card feed data */
type CardFeedData = CustomCardFeedData | DirectCardFeedData;

/** Both custom and direct company feeds */
type CompanyFeeds = Partial<Record<CompanyCardFeed, CardFeedData>>;

/** Custom feed names */
type CompanyCardNicknames = Partial<Record<CompanyCardFeed, string>>;

/** Domain settings model */
type DomainSettings = {
    /** Domain settings */
    settings: {
        /** Whether logging in with SAML is enabled for the domain */
        samlEnabled?: boolean;

        /** Whether logging in with SAML is required for the domain */
        samlRequired?: boolean;

        /** Encrypted SCIM token, exists only when Okta is enabled for the domain by support */
        oktaSCIM?: string;

        /** Email to primary contact from the domain */
        technicalContactEmail?: string;
    };
};

/** Card feeds status */
type CardFeedsStatus = {
    /** Whether we are loading the data via the API */
    isLoading?: boolean;

    /** Collection of errors coming from BE */
    errors?: OnyxCommon.Errors;
};

/**
 * Collection of card feeds status by domain ID
 */
type CardFeedsStatusByDomainID = Record<number, CardFeedsStatus>;

/**
 * Collection of card feeds status by domain ID
 */
type WorkspaceCardFeedsStatus = Record<CompanyCardFeed, CardFeedsStatus>;

/** Card feeds model, including domain settings */
type CardFeeds = {
    /** Feed settings */
    settings: {
        /** User-friendly feed nicknames */
        companyCardNicknames?: CompanyCardNicknames;

        /** Company cards feeds */
        companyCards?: Partial<Record<CompanyCardFeed, CustomCardFeedData>>;

        /** Account details */
        oAuthAccountDetails?: Partial<Record<CompanyCardFeed, DirectCardFeedData>>;

        /** Collection of card feeds status by domain ID */
        cardFeedsStatus?: WorkspaceCardFeedsStatus;

        /** Email address of the technical contact for the domain */
        technicalContactEmail?: string;

        /** Whether to use the technical contact's billing card */
        useTechnicalContactBillingCard?: boolean;
    };
} & CardFeedsStatus &
    DomainSettings;

/** Data required to be sent to add a new card */
type AddNewCardFeedData = {
    /** Card feed provider */
    feedType: CardFeedProvider;

    /** Card feed details */
    feedDetails?: CardFeedDetails;

    /** Name of the card */
    cardTitle: string;

    /** Indicates the day (preset value) when the statement period for this card ends */
    statementPeriodEnd?: StatementPeriodEnd;

    /** Indicates the day (custom day) when the statement period for this card ends */
    statementPeriodEndDay?: StatementPeriodEndDay;

    /** Selected bank */
    selectedBank: ValueOf<typeof CONST.COMPANY_CARDS.BANKS> | null;

    /** Selected feed type */
    selectedFeedType: ValueOf<typeof CONST.COMPANY_CARDS.FEED_TYPE>;

    /** Selected Amex bank custom feed */
    selectedAmexCustomFeed: ValueOf<typeof CONST.COMPANY_CARDS.AMEX_CUSTOM_FEED>;

    /** Name of the bank */
    bankName?: string;

    /** Selected country */
    selectedCountry?: string;

    /** Public token from Plaid connection */
    publicToken?: string;

    /** Feed from Plaid connection */
    plaidConnectedFeed?: string;

    /** Feed name from Plaid connection */
    plaidConnectedFeedName?: string;

    /** Plaid accounts */
    plaidAccounts?: LinkAccount[] | PlaidAccount[];
};

/** Issue new card flow steps */
type AddNewCardFeedStep = ValueOf<typeof CONST.COMPANY_CARDS.STEP>;

/** Model of Issue new card flow */
type AddNewCompanyCardFeed = {
    /** The current step of the flow */
    currentStep: AddNewCardFeedStep;

    /** Data required to be sent to issue a new card */
    data: AddNewCardFeedData;

    /** Whether the user is editing step */
    isEditing: boolean;
};

/** Card fund ID */
type FundID = number;

/** Combined card feed type */
type CombinedCardFeed = CustomCardFeedData &
    Partial<DirectCardFeedData> & {
        /** Custom feed name, originally coming from settings.companyCardNicknames */
        customFeedName?: string;

        /** Feed name */
        feed: CompanyCardFeedWithNumber;

        /** Card feed status */
        status?: CardFeedsStatus;
    };

/** Card feeds combined by domain ID into one object */
type CombinedCardFeeds = Record<CompanyCardFeedWithDomainID, CombinedCardFeed>;

export default CardFeeds;
export type {
    AddNewCardFeedStep,
    AddNewCompanyCardFeed,
    AddNewCardFeedData,
    CompanyCardFeed,
    CardFeedDetails,
    DirectCardFeedData,
    CardFeedProvider,
    CardFeedData,
    CardFeedsStatus,
    CardFeedsStatusByDomainID,
    WorkspaceCardFeedsStatus,
    CompanyFeeds,
    CompanyCardFeedWithDomainID,
    CustomCardFeedData,
    CompanyCardNicknames,
    CompanyCardFeedWithNumber,
    FundID,
    StatementPeriodEnd,
    StatementPeriodEndDay,
    DomainSettings,
    CombinedCardFeed,
    CombinedCardFeeds,
};

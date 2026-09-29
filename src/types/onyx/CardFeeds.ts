import type CONST from '@src/CONST';

import type {LinkAccount} from 'react-native-plaid-link-sdk';
import type {PlaidAccount} from 'react-plaid-link';
import type {ValueOf} from 'type-fest';

import type * as OnyxCommon from './OnyxCommon';

/** Company card feed name */
type CompanyCardFeed = ValueOf<typeof CONST.COMPANY_CARD.FEED_BANK_NAME>;
/** Company card feed name with a number */
type CompanyCardFeedWithNumber = CompanyCardFeed | `${CompanyCardFeed}${number}`;

/** Company card feed name with domain ID */
type CompanyCardFeedWithDomainID = `${CompanyCardFeedWithNumber}${typeof CONST.COMPANY_CARD.FEED_KEY_SEPARATOR}${string}`;

/**
 * Either a company card feed name or the Expensify card bank name.
 */
type CardFeed = CompanyCardFeed | typeof CONST.EXPENSIFY_CARD.BANK;

/**
 * Either a company card feed name or the Expensify card bank name with a number.
 */
type CardFeedWithNumber = CardFeed | `${CardFeed}${number}`;

/**
 * Card feed name with domain ID
 */
type CardFeedWithDomainID = `${CardFeedWithNumber}${typeof CONST.COMPANY_CARD.FEED_KEY_SEPARATOR}${string}`;

/**
 * Bank name
 */
type BankName = ValueOf<typeof CONST.COMPANY_CARDS.BANKS>;

/**
 * Bank name for card feeds that can be displayed in NewDot but cannot be added
 * as a new connection (e.g. banks without an OAuth or Plaid integration).
 */
type NonConnectableBankName = ValueOf<typeof CONST.COMPANY_CARDS.NON_CONNECTABLE_BANKS>;

/**
 * Card type name
 */
type CardTypeName = ValueOf<typeof CONST.COMPANY_CARDS.CARD_TYPE_NAMES>;

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
    processorID?: string;

    /** Financial institution (bank) ID */
    bankID?: string;

    /** Financial institution (bank) name */
    bankName?: string;

    companyID?: string;
    distributionID?: string;
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

    preferredPolicy?: string;
    linkedPolicyIDs?: string[];

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

    plaidAccessToken?: string;

    /** CSV upload layout settings (present on ccupload feeds) */
    uploadLayoutSettings?: {
        /** User-defined name for the CSV upload layout */
        layoutName?: string;

        /** Unique identifier for this CSV layout instance */
        instanceID?: string;

        /** Stored column mappings from the most recent CSV import (column name → column index) */
        columnMappings?: Record<string, string>;

        [key: string]: unknown;
    };

    /** Field-specific error messages */
    errorFields?: OnyxCommon.ErrorFields<'statementPeriodEndDay'>;

    errors?: OnyxCommon.Errors;
}>;

/** Direct card feed data */
type DirectCardFeedData = OnyxCommon.OnyxValueWithOfflineFeedback<{
    accountList: string[];
    credentials: string;
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

    plaidAccessToken?: string;

    /** Field-specific error messages */
    errorFields?: OnyxCommon.ErrorFields<'statementPeriodEndDay'>;

    errors?: OnyxCommon.Errors;
}>;

/** Card feed data */
type CardFeedData = CustomCardFeedData | DirectCardFeedData;

/** Both custom and direct company feeds */
type CompanyFeeds = Partial<Record<CompanyCardFeedWithNumber, CardFeedData>>;

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

    /** Whether we are loading the data via the API */
    isLoading?: boolean;
};

/** Card feeds status */
type CardFeedsStatus = {
    /** Whether we are loading the data via the API */
    isLoading?: boolean;

    errors?: OnyxCommon.Errors;
};

/**
 * Collection of card feeds status by domain ID
 */
type CardFeedsStatusByDomainID = Record<number, CardFeedsStatus>;

/**
 * Collection of card feeds status by domain ID
 */
type WorkspaceCardFeedsStatus = Record<CardFeedWithNumber, CardFeedsStatus>;

/** A single travel billing provisioning error for a workspace member */
type TravelBillingProvisioningError = {
    /** Account ID of the member whose card provisioning failed */
    accountID: number;

    /** Email of the member whose card provisioning failed */
    email: string;

    /** Whether the scheduled retry has already re-attempted this member */
    retried?: boolean;
};

/** Travel billing provisioning errors keyed by the failed member's account ID */
type TravelBillingProvisioningErrors = Record<string, TravelBillingProvisioningError>;

/** Card feeds model, including domain settings */
type CardFeeds = {
    settings: {
        /** User-friendly feed nicknames */
        companyCardNicknames?: Partial<Record<CardFeedWithNumber, string>>;

        /** Custom card names by card ID */
        companyCardCustomNames?: Record<string, string>;

        companyCards?: Partial<Record<CardFeedWithNumber, CustomCardFeedData>>;
        oAuthAccountDetails?: Partial<Record<CardFeedWithNumber, DirectCardFeedData>>;

        /** Collection of card feeds status by domain ID */
        cardFeedsStatus?: WorkspaceCardFeedsStatus;

        /** Email address of the technical contact for the domain */
        technicalContactEmail?: string;

        useTechnicalContactBillingCard?: boolean;

        /** Whether 2FA is required for all members */
        twoFactorAuthRequired?: boolean;

        /** List of member emails exempt from the domain's 2FA requirement */
        twoFactorAuthExemptEmails?: string[];

        /** Travel billing provisioning data. The key keeps the legacy spelling because the backend sends it. */
        travelInvoicing?: {
            /** Provisioning errors keyed by the failed member's account ID */
            errors?: TravelBillingProvisioningErrors;
        };
    };
} & CardFeedsStatus &
    DomainSettings;

/** Data required to be sent to add a new card */
type AddNewCardFeedData = {
    feedType: CardFeedProvider;
    feedDetails?: CardFeedDetails;
    cardTitle: string;
    selectedBank: ValueOf<typeof CONST.COMPANY_CARDS.BANKS> | null;
    selectedFeedType: ValueOf<typeof CONST.COMPANY_CARDS.FEED_TYPE>;

    /** Selected Amex bank custom feed */
    selectedAmexCustomFeed: ValueOf<typeof CONST.COMPANY_CARDS.AMEX_CUSTOM_FEED>;

    bankName?: string;
    selectedCountry?: string;

    /** Public token from Plaid connection */
    publicToken?: string;

    plaidConnectedFeed?: string;
    plaidConnectedFeedName?: string;

    /** Name of the CSV layout template */
    companyCardLayoutName?: string;

    /** Identifier for the CSV layout template */
    layoutType?: string;

    /** Existing instance ID when editing a CSV feed */
    existingInstanceID?: string;

    /** Account that owns the CSV feed being edited */
    domainAccountID?: number;

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

        feed: CardFeedWithNumber;
        status?: CardFeedsStatus;
    };

/** Card feeds combined by domain ID into one object */
type CombinedCardFeeds = Record<CardFeedWithDomainID, CombinedCardFeed>;

export default CardFeeds;
export type {
    AddNewCardFeedStep,
    AddNewCompanyCardFeed,
    AddNewCardFeedData,
    CardFeed,
    CardFeedWithNumber,
    CardFeedWithDomainID,
    BankName,
    NonConnectableBankName,
    CardTypeName,
    CompanyCardFeed,
    CompanyCardFeedWithNumber,
    CompanyCardFeedWithDomainID,
    CardFeedDetails,
    CardFeedProvider,
    CardFeedData,
    CardFeedsStatus,
    CardFeedsStatusByDomainID,
    WorkspaceCardFeedsStatus,
    CompanyFeeds,
    CustomCardFeedData,
    FundID,
    StatementPeriodEnd,
    StatementPeriodEndDay,
    DomainSettings,
    CombinedCardFeed,
    CombinedCardFeeds,
    TravelBillingProvisioningErrors,
};

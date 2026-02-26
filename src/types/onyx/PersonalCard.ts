import type {LinkAccount} from 'react-native-plaid-link-sdk';
import type {PlaidAccount} from 'react-plaid-link';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';

/** Card feed */
type PersonalCardFeed = ValueOf<typeof CONST.PERSONAL_CARDS.FEED_BANK_NAME>;

/** Company card feed with domain ID */
type PersonalCardFeedWithDomainID = `${PersonalCardFeed}${typeof CONST.PERSONAL_CARDS.FEED_KEY_SEPARATOR}${string}`;

/** Custom card feed with a number */
type PersonalCardFeedWithNumber = PersonalCardFeed | `${PersonalCardFeed}${number}` | PersonalCardFeedWithDomainID;

/** Card feed provider */
type PersonalCardFeedProvider = typeof CONST.PERSONAL_CARDS.FEED_BANK_NAME.AMEX;

/** Card feed details */
type PersonalCardFeedDetails = {
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
type PersonalCardFeedData = DirectCardFeedData;

/** Both custom and direct company feeds */
type CardFeeds = Partial<Record<PersonalCardFeed, PersonalCardFeedData>>;

/** Custom feed names */
type CompanyCardNicknames = Partial<Record<PersonalCardFeed, string>>;

/** Domain settings model */
type PersonalCardDomainSettings = {
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

/** Card feeds model, including domain settings */
type PersonalCardFeeds = {
    /** Feed settings */
    settings: {
        /** User-friendly feed nicknames */
        companyCardNicknames?: CompanyCardNicknames;

        /** Company cards feeds */
        companyCards?: Partial<PersonalCardFeed>;

        /** Account details */
        oAuthAccountDetails?: Partial<Record<PersonalCardFeed, DirectCardFeedData>>;

        /** Email address of the technical contact for the domain */
        technicalContactEmail?: string;

        /** Whether to use the technical contact's billing card */
        useTechnicalContactBillingCard?: boolean;
    };

    /** Whether we are loading the data via the API */
    isLoading?: boolean;
} & PersonalCardDomainSettings;

/** Data required to be sent to add a new card */
type AddNewPersonalCardFeedData = {
    /** Card feed provider */
    feedType: PersonalCardFeedProvider;

    /** Card feed details */
    feedDetails?: PersonalCardFeedDetails;

    /** Name of the card */
    cardTitle: string;

    /** Selected bank */
    selectedBank: ValueOf<typeof CONST.PERSONAL_CARDS.BANKS> | null;

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
type AddNewPersonalCardFeedStep = ValueOf<typeof CONST.PERSONAL_CARDS.STEP>;

/** Model of Issue new card flow */
type AddNewPersonalCard = {
    /** The current step of the flow */
    currentStep: AddNewPersonalCardFeedStep;

    /** Data required to be sent to issue a new card */
    data: AddNewPersonalCardFeedData;

    /** Whether the user is editing step */
    isEditing: boolean;
};

/** Card fund ID */
type FundID = number;

export default PersonalCardFeeds;
export type {
    AddNewPersonalCardFeedStep,
    AddNewPersonalCard,
    AddNewPersonalCardFeedData,
    PersonalCardFeed,
    PersonalCardFeedDetails,
    DirectCardFeedData,
    PersonalCardFeedProvider,
    PersonalCardFeedData,
    CardFeeds,
    PersonalCardFeedWithDomainID,
    CompanyCardNicknames,
    PersonalCardFeedWithNumber,
    FundID,
    PersonalCardDomainSettings,
};

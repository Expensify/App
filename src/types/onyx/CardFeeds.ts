import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type * as OnyxCommon from './OnyxCommon';

/** Card feed */
type CompanyCardFeed = ValueOf<typeof CONST.COMPANY_CARD.FEED_BANK_NAME>;

/** Card feed provider */
type CardFeedProvider =
    | typeof CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD
    | typeof CONST.COMPANY_CARD.FEED_BANK_NAME.VISA
    | typeof CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX
    | typeof CONST.COMPANY_CARD.FEED_BANK_NAME.STRIPE;

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

    /** Specifies the format for the report title related to this card */
    reportTitleFormat?: string;

    /** Indicates the day when the statement period for this card ends */
    statementPeriodEndDay?: string;

    /** Broken connection errors */
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

    /** Whether any actions are pending */
    pending?: boolean;

    /** Broken connection errors */
    errors?: OnyxCommon.Errors;
}>;

/** Card feed data */
type CardFeedData = CustomCardFeedData | DirectCardFeedData;

/** Both custom and direct company feeds */
type CompanyFeeds = Partial<Record<CompanyCardFeed, CardFeedData>>;

/** Custom feed names */
type CompanyCardNicknames = Partial<Record<CompanyCardFeed, string>>;

/** Card feeds model */
type CardFeeds = {
    /** Feed settings */
    settings: {
        /** User-friendly feed nicknames */
        companyCardNicknames?: CompanyCardNicknames;

        /** Company cards feeds */
        companyCards?: Partial<Record<CompanyCardFeed, CustomCardFeedData>>;

        /** Account details */
        oAuthAccountDetails?: Partial<Record<CompanyCardFeed, DirectCardFeedData>>;
    };

    /** Whether we are loading the data via the API */
    isLoading?: boolean;
};

/** Data required to be sent to add a new card */
type AddNewCardFeedData = {
    /** Card feed provider */
    feedType: CardFeedProvider;

    /** Name of the card */
    cardTitle: string;

    /** Selected bank */
    selectedBank: ValueOf<typeof CONST.COMPANY_CARDS.BANKS>;

    /** Selected feed type */
    selectedFeedType: ValueOf<typeof CONST.COMPANY_CARDS.FEED_TYPE>;

    /** Selected Amex bank custom feed */
    selectedAmexCustomFeed: ValueOf<typeof CONST.COMPANY_CARDS.AMEX_CUSTOM_FEED>;

    /** Name of the bank */
    bankName?: string;
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

export default CardFeeds;
export type {
    AddNewCardFeedStep,
    AddNewCompanyCardFeed,
    AddNewCardFeedData,
    CardFeedData,
    CustomCardFeedData,
    CompanyCardFeed,
    DirectCardFeedData,
    CardFeedProvider,
    CompanyFeeds,
    CompanyCardNicknames,
};

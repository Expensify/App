/** Card feed data */
type CardFeedData = {
    /** Whether any actions are pending */
    pending: boolean;

    /** Determines if Automated Statement Reconciliation (ASR) is enabled for the cards */
    asrEnabled: boolean;

    /** Specifies if the expenses on this card should be force reimbursable */
    forceReimbursable: string;

    /** Defines the type of liability for the card */
    liabilityType: string;

    /** Preferred policy */
    preferredPolicy: string;

    /** Specifies the format for the report title related to this card */
    reportTitleFormat: string;

    /** Indicates the day when the statement period for this card ends */
    statementPeriodEndDay: string;
};

/** Card feeds model */
type CardFeeds = {
    /** Company cards feeds */
    companyCards: Record<string, CardFeedData>;

    /** User-friendly feed nicknames */
    companyCardNicknames: Record<string, string>;
};

export default CardFeeds;

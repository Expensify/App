type CardFeedData = {
    pending: boolean;
    asrEnabled: boolean;
    forceReimbursable: string;
    liabilityType: string;
    preferredPolicy: string;
    reportTitleFormat: string;
    statementPeriodEndDay: string;
};

type CardFeeds = {
    companyCards: Record<string, CardFeedData>;
    companyCardNicknames: Record<string, string>;
};

export default CardFeeds;

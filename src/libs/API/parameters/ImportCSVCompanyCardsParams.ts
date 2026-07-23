type ImportCSVCompanyCardsParams = {
    /** ID of the policy to which the company cards will be imported */
    policyID: string;

    /** JSON object containing the settings for the layout */
    settings: string;

    /** Stringified JSON array of imported row data */
    csvData: string;

    /** Account that owns the feed */
    domainAccountID?: number;
};

export default ImportCSVCompanyCardsParams;

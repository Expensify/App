type ImportCSVCompanyCardsParams = {
    /** ID of the policy to which the company cards will be imported */
    policyID: string;

    /** JSON object containing the settings for the layout */
    settings: string;

    /** Stringified JSON array of imported row data */
    csvData: string;

    /** Account that owns the feed. Set for domain feeds surfaced in the policy via a preferred/linked workspace, so the backend updates the existing feed on the +@domain account instead of creating a duplicate on the workspace account */
    domainAccountID?: number;
};

export default ImportCSVCompanyCardsParams;

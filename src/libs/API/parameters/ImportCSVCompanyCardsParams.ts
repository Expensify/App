type ImportCSVCompanyCardsParams = {
    /** ID of the policy to which the company cards will be imported */
    policyID: string;

    /** Name of the card feed layout */
    layoutName: string;

    /** Type of the card feed layout */
    layoutType: string;

    /** JSON object containing the settings for the layout */
    settings: string;

    /** Stringified JSON array of imported row data */
    csvData: string;
};

export default ImportCSVCompanyCardsParams;

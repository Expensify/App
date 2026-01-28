type ImportCSVCompanyCardsParams = {
    /** ID of the policy to which the company cards will be imported */
    policyID: string;

    /** Name of the card feed layout */
    layoutName: string;

    /** Type of the card feed layout */
    layoutType: string;

    /** Stringified JSON array of column mapping settings, ordered by column index */
    settings: string;

    /** Stringified JSON array of imported row data */
    csvData: string;
};

export default ImportCSVCompanyCardsParams;

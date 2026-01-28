type ImportCSVCompanyCardsParams = {
    /** ID of the policy to which the company cards will be imported */
    policyID: string;

    /** Name of the CSV template */
    templateName: string;

    /** Stringified JSON array of column mappings, ordered by column index */
    templateSettings: string;
};

export default ImportCSVCompanyCardsParams;

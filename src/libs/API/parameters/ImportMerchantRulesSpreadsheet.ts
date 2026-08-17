type ImportMerchantRulesSpreadsheetParams = {
    /** ID of the policy */
    policyID: string;

    /**
     * Stringified JSON object mapping client-generated ruleID to coding rule value:
     * Record<string, {filters: {left: string; operator: string; right: string}; merchant?: string; category?: string; comment?: string; reimbursable?: boolean; billable?: boolean}>
     */
    rules: string;
};

export default ImportMerchantRulesSpreadsheetParams;

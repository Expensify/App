type ImportCategoriesSpreadsheetParams = {
    /** ID of the policy */
    policyID: string;

    /**
     * Stringified JSON object with type of following structure:
     * Array<{
     *   name: string;
     *   enabled?: boolean;
     *   'GL Code'?: string;
     *   maxAmountNoReceipt?: number;
     *   maxAmountNoItemizedReceipt?: number;
     * }>
     */
    categories: string;
};

export default ImportCategoriesSpreadsheetParams;

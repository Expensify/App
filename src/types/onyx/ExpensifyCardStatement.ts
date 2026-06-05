/** Model of Expensify Card statement PDF generation state */
type ExpensifyCardStatement = {
    /** Whether we are currently generating a PDF version of the statement */
    isGenerating: boolean;
    /**
     * Cache key format: "{policyID}_{feedCountry}_{sha1(sortedEntryIDs)}" with filename as value.
     * Boolean value added for isGenerating key.
     */
    [cacheKey: string]: string | boolean;
};

export default ExpensifyCardStatement;

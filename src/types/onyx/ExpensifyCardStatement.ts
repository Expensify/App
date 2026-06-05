/** Model of Expensify Card statement PDF generation state */
type ExpensifyCardStatement = {
    /** Whether we are currently generating a PDF version of the statement */
    isGenerating: boolean;
    /**
     * Server-owned cache keys map to generated PDF filenames.
     * Boolean value added for isGenerating key.
     */
    [cacheKey: string]: string | boolean;
};

export default ExpensifyCardStatement;

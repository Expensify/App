/** Model of Expensify Card statement */
type ExpensifyCardStatement = {
    /** Whether we are currently generating a PDF version of the statement */
    isGenerating: boolean;

    /**
     * Dynamic keys in the format "{domain}_{startDate}_{endDate}" with the S3 filename as value.
     * The boolean value is for the isGenerating key.
     */
    [key: string]: string | boolean;
};

export default ExpensifyCardStatement;

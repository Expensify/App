/** Model of Expensify Card statement PDF generation state */
type ExpensifyCardStatement = {
    /** Whether a statement PDF is currently being generated */
    isGenerating: boolean;

    /** Maps a server-owned cache key to its generated PDF filename (the boolean covers isGenerating above) */
    [cacheKey: string]: string | boolean;
};

export default ExpensifyCardStatement;

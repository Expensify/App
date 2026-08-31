/** Model of travel billing statement */
type TravelBillingStatement = {
    /** Whether we are currently generating a PDF version of the statement */
    isGenerating: boolean;
    /**
     * Cache key format: "{policyID}_{startDate}_{endDate}" with filename as value.
     * Boolean value added for isGenerating key.
     */
    [cacheKey: string]: string | boolean;
};

export default TravelBillingStatement;

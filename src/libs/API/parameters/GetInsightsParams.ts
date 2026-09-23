type GetInsightsParams = {
    /** Stringified JSON holding the dashboard-wide search query and its hash, plus `insightsHashes`, the snapshot hash of every graph on the dashboard. */
    jsonQuery: string;
};

export default GetInsightsParams;

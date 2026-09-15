type GetInsightsParams = {
    /** Stringified JSON holding the dashboard-wide search query plus `insightsHashes`, the snapshot hash of every graph on the dashboard. */
    jsonQuery: string;
};

export default GetInsightsParams;

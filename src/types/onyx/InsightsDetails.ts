import type {Errors} from './OnyxCommon';

/** Summary of the period and the item's average over the previous periods */
type InsightsDetailsSummary = {
    /** Spend in the period, in the group currency's smallest unit */
    total: number;

    count: number;

    /**
     * The item's percentage of all spend in the period.
     * On Spend over time, the period's percentage of all spend in the Date range instead.
     */
    shareOfTotal: number;

    /** Spend per complete period before the summarized one, or null when there's no history to average */
    average: number | null;

    /** Number of complete periods the average covers, up to a year's worth */
    averagePeriodCount: number;
};

/** Data of one Insights Details panel */
type InsightsDetails = {
    summary?: InsightsDetailsSummary;
    errors?: Errors;

    /** Workspaces in the Top spenders panel that View all must keep in scope */
    eligiblePolicyIDs?: string[];

    /** JSON code of the failed GetInsightsDetails request stored with errors */
    responseJsonCode?: number;
};

export type {InsightsDetailsSummary};
export default InsightsDetails;

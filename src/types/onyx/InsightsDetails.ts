import type {Errors} from './OnyxCommon';

/** How the summarized period compares to the item's own history */
type InsightsDetailsSummary = {
    /** Spend in the period, in the group currency's smallest unit */
    total: number;

    /** Number of expenses in the period */
    count: number;

    /** Percentage of all spend in the period, or in the Date range for Spend over time, that the item accounts for */
    shareOfTotal: number;

    /** Spend per complete period before the summarized one, or null when there's no history to average */
    average: number | null;

    /** Number of complete periods the average covers, up to a year's worth */
    averagePeriodCount: number;
};

/** What the backend returns for one Details panel */
type InsightsDetails = {
    summary?: InsightsDetailsSummary;

    errors?: Errors;

    /** JSON code of the failed GetInsightsDetails request stored with errors */
    responseJsonCode?: number;
};

export type {InsightsDetailsSummary};
export default InsightsDetails;

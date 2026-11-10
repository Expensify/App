import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {Errors} from './OnyxCommon';

/** Identifies a dashboard, paired with the query hash in the key an entry is stored under */
type InsightsDashboardID = ValueOf<typeof CONST.INSIGHTS.DASHBOARD>;

/** Identifies a dashboard to the backend, and keys the filters stored for it */
type InsightsSearchKey = ValueOf<typeof CONST.INSIGHTS.SEARCH_KEY>;

/** Key identifying a graph within a dashboard response */
type InsightsGraphKey = ValueOf<typeof CONST.INSIGHTS.GRAPH>;

/** Reference to graph data stored in a search snapshot */
type InsightsGraph = {
    /** Hash of the graph's search snapshot */
    snapshotHash?: number;

    /** Hash of the snapshot holding the data for the "Previous period" compare mode */
    previousPeriodSnapshotHash?: number;

    /** Hash of the snapshot holding the data for the "Average" compare mode */
    averageSnapshotHash?: number;

    /** Average group total over the selected period, in the same units as the snapshot's totals, which the "Average" compare mode draws on amount charts */
    averageAmount?: number;

    /** Average number of expenses per group over the selected period, which the "Average" compare mode draws on count charts */
    averageCount?: number;
};

/** AI-written insight about the dashboard's data */
type AIInsight = {
    /** Narration shown on the card */
    text: string;

    /** Message sent to Concierge when the user asks it to explain the card */
    explainPrompt: string;
};

/** Expenses dated after the day the dashboard counts through, which every graph leaves out */
type InsightsFutureExpenses = {
    /** Number of expenses dated after that day within the date range */
    count: number;

    /** Their total in the group currency, in the same units as the snapshot's totals */
    total: number;

    /** Group currency the total is converted to */
    currency: string;
};

/** What the backend returns for one dashboard and set of filters */
type InsightsDashboard = {
    /** Snapshots the response filled, keyed by the graph slot each chart's spec declares */
    graphs?: Partial<Record<InsightsGraphKey, InsightsGraph>>;

    /** Last day the graphs count expenses through, as a yyyy-MM-dd string */
    asOfDate?: string;

    /** Expenses in the date range dated after `asOfDate` */
    futureExpenses?: InsightsFutureExpenses;

    /** Whether the account has any expenses at all, regardless of the query, so an empty account can be told apart from filters that matched nothing */
    hasResults?: boolean;

    /** Cards drawn above the headline chart */
    aiInsights?: AIInsight[];

    /** Query the stored graphs answer */
    inputQuery?: string;

    errors?: Errors;

    /** JSON code of the failed GetInsights request stored with errors */
    responseJsonCode?: number;
};

export type {AIInsight, InsightsDashboardID, InsightsFutureExpenses, InsightsGraphKey, InsightsSearchKey};
export default InsightsDashboard;

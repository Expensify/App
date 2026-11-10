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

/** Kind of signal an AI insight was detected from */
type AIInsightSignal = ValueOf<typeof CONST.INSIGHTS.AI_INSIGHT.SIGNAL>;

/** Unit of a chip's value. Currency amounts are in the Group currency's cents. */
type AIInsightChipUnit = ValueOf<typeof CONST.INSIGHTS.AI_INSIGHT.CHIP_UNIT>;

/** Chip showing how much an item changed, colored by whether the change is good or bad */
type AIInsightChangeChip = {
    type: typeof CONST.INSIGHTS.AI_INSIGHT.CHIP_TYPE.CHANGE;
    direction: ValueOf<typeof CONST.INSIGHTS.AI_INSIGHT.CHIP_DIRECTION>;
    unit: AIInsightChipUnit;

    /** Size of the change, without its sign */
    value: number;
};

/** Chip showing a share or amount for signals that have no direction */
type AIInsightNeutralChip = {
    type: typeof CONST.INSIGHTS.AI_INSIGHT.CHIP_TYPE.NEUTRAL;
    unit: AIInsightChipUnit;
    value: number;
};

/** Stat shown at the top of an AI insight card */
type AIInsightChip = AIInsightChangeChip | AIInsightNeutralChip;

/** AI-written insight about the dashboard's data */
type AIInsight = {
    id: string;
    signal: AIInsightSignal;

    /** Item that changed, like a merchant, member, or "Total spend" */
    title: string;

    chip: AIInsightChip;

    /** One short line under the title */
    summary: string;

    /** Message sent to Concierge when the user asks it to explain the card */
    explainPrompt: string;
};

/** What the backend returns for one dashboard and set of filters */
type InsightsDashboard = {
    /** Snapshots the response filled, keyed by the graph slot each chart's spec declares */
    graphs?: Partial<Record<InsightsGraphKey, InsightsGraph>>;

    /** Whether the account has any expenses at all, regardless of the query, so an empty account can be told apart from filters that matched nothing */
    hasResults?: boolean;

    /** Cards drawn above the headline chart. Missing until they're written, and empty when there are none. */
    aiInsights?: AIInsight[];

    /** Query the stored graphs answer */
    inputQuery?: string;

    errors?: Errors;

    /** JSON code of the failed GetInsights request stored with errors */
    responseJsonCode?: number;
};

export type {AIInsight, AIInsightChip, InsightsDashboardID, InsightsGraphKey, InsightsSearchKey};
export default InsightsDashboard;

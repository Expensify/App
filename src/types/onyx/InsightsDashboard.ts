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

    /** Workspaces in the Top spenders ranking that its Spend link must keep in scope */
    eligiblePolicyIDs?: string[];

    /** Average group total over the selected period, in the same units as the snapshot's totals, which the "Average" compare mode draws on amount charts */
    averageAmount?: number;

    /** Average number of expenses per group over the selected period, which the "Average" compare mode draws on count charts */
    averageCount?: number;

    /** Average group duration over the selected period, in seconds, which the "Average" compare mode draws on duration charts */
    averageDuration?: number;
};

/** Kind of signal an AI insight was detected from */
type AIInsightSignal = ValueOf<typeof CONST.INSIGHTS.AI_INSIGHT.SIGNAL>;

/** Values that can represent a change or an observed statistic */
type AIInsightChipValue =
    | {
          unit: typeof CONST.INSIGHTS.AI_INSIGHT.CHIP_UNIT.PERCENT;
          value: number;
      }
    | {
          unit: typeof CONST.INSIGHTS.AI_INSIGHT.CHIP_UNIT.AMOUNT;

          /** Amount in cents */
          value: number;
          currency: string;
      }
    | {
          unit: typeof CONST.INSIGHTS.AI_INSIGHT.CHIP_UNIT.DURATION;

          /** Duration in seconds */
          value: number;
      };

/** Chip showing how much an item changed */
type AIInsightChangeChip = AIInsightChipValue & {
    type: typeof CONST.INSIGHTS.AI_INSIGHT.CHIP_TYPE.CHANGE;
    direction: ValueOf<typeof CONST.INSIGHTS.AI_INSIGHT.CHIP_DIRECTION>;
};

/** Chip showing an observed statistic rather than a change */
type AIInsightNeutralChip = (
    | AIInsightChipValue
    | {
          unit: typeof CONST.INSIGHTS.AI_INSIGHT.CHIP_UNIT.COUNT;
          value: number;
      }
) & {
    type: typeof CONST.INSIGHTS.AI_INSIGHT.CHIP_TYPE.NEUTRAL;
};

/** An AI insight's statistic: a change or an observed value */
type AIInsightChip = AIInsightChangeChip | AIInsightNeutralChip;

/** AI-written insight about the dashboard's data */
type AIInsight = {
    id: string;
    signal: AIInsightSignal;
    title: string;
    chip: AIInsightChip;
    summary: string;

    /** Message sent to Concierge when the user asks it to explain the card */
    explainPrompt: string;

    /** 1-based tag level paired with parentTagPath; absent on older cached cards */
    tagLevel?: number;

    /** Encoded ancestors for this tag; an empty string selects independent tags */
    parentTagPath?: string;
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

/** Names one tag level has across the workspaces the dashboard covers */
type InsightsTagLevel = {
    /** 1-based position in the workspaces' configured tag lists */
    level: number;

    /** Distinct non-empty names the workspaces give this level */
    names: string[];
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

    /** Cards drawn above the headline chart. Missing until they're written, and empty when there are none. */
    aiInsights?: AIInsight[];

    /** Tag levels of the workspaces in scope that have tags enabled, sent only when the Spend dashboard requests Top tags */
    tagLevels?: InsightsTagLevel[];

    /** When the request that stored this response was sent, in milliseconds since the epoch. Set by the client, so the newest stored response for a set of workspaces can be found. */
    requestedAt?: number;

    /** Query the stored graphs answer */
    inputQuery?: string;

    errors?: Errors;

    /** JSON code of the failed GetInsights request stored with errors */
    responseJsonCode?: number;
};

export type {AIInsight, AIInsightChip, InsightsDashboardID, InsightsFutureExpenses, InsightsGraphKey, InsightsSearchKey, InsightsTagLevel};
export default InsightsDashboard;

import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {Errors} from './OnyxCommon';

/** Identifies a dashboard, paired with the query hash in the key an entry is stored under */
type InsightsDashboardID = ValueOf<typeof CONST.INSIGHTS.DASHBOARD>;

/** Key identifying a graph within a dashboard response */
type InsightsGraphKey = ValueOf<typeof CONST.INSIGHTS.GRAPH>;

/** Reference to graph data stored in a search snapshot */
type InsightsGraph = {
    /** Hash of the graph's search snapshot */
    snapshotHash?: number;

    /** Hash of the snapshot holding the same graph over the period before the one on screen, set only while comparing */
    previousPeriodSnapshotHash?: number;
};

/** What the backend returns for one dashboard and set of filters */
type InsightsDashboard = {
    /** Where each chart finds its data, keyed by the graph slot its spec declares */
    graphs?: Partial<Record<InsightsGraphKey, InsightsGraph>>;

    /** Whether the account has any expenses at all, regardless of the query, so an empty account can be told apart from filters that matched nothing */
    hasResults?: boolean;

    /** Query the stored graphs answer */
    inputQuery?: string;

    errors?: Errors;
};

export type {InsightsDashboardID, InsightsGraphKey};
export default InsightsDashboard;

import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {Errors} from './OnyxCommon';

/** Suffix identifying an entry in the Insights Onyx collection */
type InsightsDashboardID = ValueOf<typeof CONST.INSIGHTS.DASHBOARD>;

/** Key identifying a graph within a dashboard response */
type InsightsGraphKey = ValueOf<typeof CONST.INSIGHTS.GRAPH>;

/** Reference to graph data stored in a search snapshot */
type InsightsGraph = {
    /** Hash of the graph's search snapshot */
    snapshotHash?: number;
};

/** Backend response and request state for a dashboard */
type InsightsDashboard = {
    graphs?: Partial<Record<InsightsGraphKey, InsightsGraph>>;
    /** Query resolved by the backend */
    inputQuery?: string;
    requestedQuery?: string;
    errors?: Errors;
};

export type {InsightsDashboardID, InsightsGraphKey};
export default InsightsDashboard;

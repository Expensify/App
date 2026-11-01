import type {InsightsDashboardID} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import type {SearchKey} from './SearchKeyUtils';

/**
 * Where the user last was inside each of the More menu's destinations.
 *
 * The menu's rows stand for groups of pages rather than single ones, so opening a row should return the user where
 * they left off instead of always the group's first page. Workspaces is absent because its own tab already restores
 * the last workspace or domain through `useRestoreWorkspacesTabOnNavigate`.
 *
 * This is deliberately session-scoped module state rather than Onyx: it is a navigation convenience, and outliving a
 * reload would mean persisting a pointer to a search that may no longer exist.
 */
/** The rows the More page offers, so the tab can reopen whichever the user last chose. */
const MORE_DESTINATIONS = {
    ACCOUNTING: 'accounting',
    SAVED_SEARCHES: 'savedSearches',
    INSIGHTS: 'insights',
    WORKSPACES: 'workspaces',
} as const;

type MoreDestination = ValueOf<typeof MORE_DESTINATIONS>;

const lastVisitedSearchKeyByGroup = new Map<string, SearchKey>();
let lastVisitedMoreDestination: MoreDestination | undefined;
let lastVisitedInsightsDashboard: InsightsDashboardID | undefined;

/** Records the Spend search the user is on, under the group it belongs to. */
function setLastVisitedSearchKey(groupID: string, searchKey: SearchKey) {
    lastVisitedSearchKeyByGroup.set(groupID, searchKey);
}

/** The group's last visited search, or undefined when the user hasn't opened one this session. */
function getLastVisitedSearchKey(groupID: string): SearchKey | undefined {
    return lastVisitedSearchKeyByGroup.get(groupID);
}

/** Records which More row the user opened, so tapping More again returns there instead of the list. */
function setLastVisitedMoreDestination(destination: MoreDestination) {
    lastVisitedMoreDestination = destination;
}

function getLastVisitedMoreDestination(): MoreDestination | undefined {
    return lastVisitedMoreDestination;
}

/** Clears the remembered row, so More opens on its list again. */
function clearLastVisitedMoreDestination() {
    lastVisitedMoreDestination = undefined;
}

function setLastVisitedInsightsDashboard(dashboardID: InsightsDashboardID) {
    lastVisitedInsightsDashboard = dashboardID;
}

function getLastVisitedInsightsDashboard(): InsightsDashboardID | undefined {
    return lastVisitedInsightsDashboard;
}

export {
    clearLastVisitedMoreDestination,
    getLastVisitedInsightsDashboard,
    getLastVisitedMoreDestination,
    getLastVisitedSearchKey,
    MORE_DESTINATIONS,
    setLastVisitedInsightsDashboard,
    setLastVisitedMoreDestination,
    setLastVisitedSearchKey,
};
export type {MoreDestination};

import type {InsightsDashboardID} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import type {SearchKey} from './SearchKeyUtils';

/**
 * Where the user last was inside each of the More menu's destinations.
 *
 * The menu's rows stand for groups of pages rather than single ones, so opening a row should return the user where
 * they left off instead of always the group's first page. Workspaces keeps no entry here because
 * `useRestoreWorkspacesTabOnNavigate` already restores the last workspace or domain.
 *
 * This is deliberately session-scoped module state rather than Onyx: it is a navigation convenience, and outliving a
 * reload would mean persisting a pointer to a search that may no longer exist. It is reset on sign-out.
 */
const MORE_DESTINATIONS = {
    ACCOUNTING: 'accounting',
    SAVED_SEARCHES: 'savedSearches',
    INSIGHTS: 'insights',
    WORKSPACES: 'workspaces',
} as const;

type MoreDestination = ValueOf<typeof MORE_DESTINATIONS>;

/** Everything needed to reopen a search exactly as the user left it, including filters they applied. */
type VisitedSearch = {
    searchKey: SearchKey;
    query: string;
    name?: string;
};

const lastVisitedSearchByGroup = new Map<string, VisitedSearch>();
let lastVisitedMoreDestination: MoreDestination | undefined;
let lastVisitedInsightsDashboard: InsightsDashboardID | undefined;

/** Records the Spend search the user is on, under the group it belongs to. */
function setLastVisitedSearch(groupID: string, search: VisitedSearch) {
    lastVisitedSearchByGroup.set(groupID, search);
}

/** The group's last visited search, or undefined when the user hasn't opened one this session. */
function getLastVisitedSearch(groupID: string): VisitedSearch | undefined {
    return lastVisitedSearchByGroup.get(groupID);
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

/** Forgets everything, so the next account to sign in on this device doesn't inherit the previous one's places. */
function resetMoreDestinationHistory() {
    lastVisitedSearchByGroup.clear();
    lastVisitedMoreDestination = undefined;
    lastVisitedInsightsDashboard = undefined;
}

export {
    clearLastVisitedMoreDestination,
    getLastVisitedInsightsDashboard,
    getLastVisitedMoreDestination,
    getLastVisitedSearch,
    MORE_DESTINATIONS,
    resetMoreDestinationHistory,
    setLastVisitedInsightsDashboard,
    setLastVisitedMoreDestination,
    setLastVisitedSearch,
};
export type {MoreDestination, VisitedSearch};

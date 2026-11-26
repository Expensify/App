/** Builds the Top tags level options from the tag levels GetInsights lists for the dashboard's workspaces. */
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsDashboard} from '@src/types/onyx';
import type {InsightsTagLevel} from '@src/types/onyx/InsightsDashboard';

import type {OnyxCollection} from 'react-native-onyx';

import {parseInsightsFilters} from './insightsFilterParsing';

type InsightsTagLevelOption = {value: number; label: string};

/**
 * @param tagLevels - Levels GetInsights listed, or undefined until it responds
 * @returns one option per level, named when every workspace in scope gives the level the same name
 */
function getInsightsTagLevelOptions(tagLevels: InsightsTagLevel[] | undefined, getFallbackLabel: (level: number) => string): InsightsTagLevelOption[] {
    const levels = tagLevels ?? [];
    const count = Math.max(CONST.INSIGHTS.DEFAULT_TAG_LEVEL, ...levels.map(({level}) => level));
    return Array.from({length: count}, (_, index) => {
        const names = levels.find(({level}) => level === index + 1)?.names ?? [];
        return {value: index + 1, label: names.length === 1 ? names[0] : getFallbackLabel(index + 1)};
    });
}

/** Keeps a level that GetInsights listed for a workspace in scope, and falls back to the default level otherwise. */
function getFittingTagLevel(level: number, tagLevels: InsightsTagLevel[]): number {
    return level === CONST.INSIGHTS.DEFAULT_TAG_LEVEL || tagLevels.some((tagLevel) => tagLevel.level === level) ? level : CONST.INSIGHTS.DEFAULT_TAG_LEVEL;
}

// The selector reading stored levels runs on every Insights update, so each stored query is parsed only once.
const policyScopeByQuery = new Map<string, string>();

function getPolicyScope(policyIDs: string[]): string {
    return [...policyIDs].sort().join(',');
}

function getQueryPolicyScope(inputQuery: string): string {
    const cachedScope = policyScopeByQuery.get(inputQuery);
    if (cachedScope !== undefined) {
        return cachedScope;
    }
    const scope = getPolicyScope(parseInsightsFilters(inputQuery).policyIDs ?? []);
    policyScopeByQuery.set(inputQuery, scope);
    return scope;
}

/** Finds the tag levels a stored Spend response listed for the same workspaces, which the level menu shows until the response for the current filters arrives. */
function getStoredTagLevels(dashboards: OnyxCollection<InsightsDashboard>, policyIDs: string[]): InsightsTagLevel[] | undefined {
    const spendKeyPrefix = `${ONYXKEYS.COLLECTION.INSIGHTS}${CONST.INSIGHTS.DASHBOARD.SPEND}_`;
    const scope = getPolicyScope(policyIDs);
    const storedDashboard = Object.entries(dashboards ?? {}).find(
        ([key, dashboard]) => key.startsWith(spendKeyPrefix) && !!dashboard?.tagLevels && !!dashboard.inputQuery && getQueryPolicyScope(dashboard.inputQuery) === scope,
    );
    return storedDashboard?.[1]?.tagLevels;
}

export {getFittingTagLevel, getInsightsTagLevelOptions, getStoredTagLevels};
export type {InsightsTagLevelOption};

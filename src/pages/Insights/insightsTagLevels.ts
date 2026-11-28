/** Builds the Top tags level options from the tag levels GetInsights lists for the dashboard's workspaces. */
import {getTagLists} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyTagLists} from '@src/types/onyx';
import type {InsightsResponseTagLevels, InsightsTagLevel} from '@src/types/onyx/InsightsDashboard';

import type {OnyxCollection} from 'react-native-onyx';

import {parseInsightsFilters} from './insightsFilterParsing';

type InsightsTagLevelOption = {value: number; label: string};

/**
 * @param tagLevels - Levels GetInsights listed, or undefined until it responds
 * @param selectedTagLevel - Level the dashboard filters by, kept in the options even when the levels leave it out, so the menu stays available to switch away from it
 * @returns one option per level, named when every workspace in scope gives the level the same name
 */
function getInsightsTagLevelOptions(tagLevels: InsightsTagLevel[] | undefined, selectedTagLevel: number | undefined, getFallbackLabel: (level: number) => string): InsightsTagLevelOption[] {
    const levels = tagLevels ?? [];
    const count = Math.max(CONST.INSIGHTS.DEFAULT_TAG_LEVEL, ...levels.map(({level}) => level));
    const options = Array.from({length: count}, (_, index) => {
        const names = levels.find(({level}) => level === index + 1)?.names ?? [];
        return {value: index + 1, label: names.length === 1 ? names[0] : getFallbackLabel(index + 1)};
    });
    if (selectedTagLevel === undefined || selectedTagLevel <= count) {
        return options;
    }
    return [...options, {value: selectedTagLevel, label: getFallbackLabel(selectedTagLevel)}];
}

/** Keeps a level that GetInsights listed for a workspace in scope, and falls back to the default level otherwise. */
function getFittingTagLevel(level: number, tagLevels: InsightsTagLevel[]): number {
    return level === CONST.INSIGHTS.DEFAULT_TAG_LEVEL || tagLevels.some((tagLevel) => tagLevel.level === level) ? level : CONST.INSIGHTS.DEFAULT_TAG_LEVEL;
}

/**
 * Checks whether the levels for the current filters already show that no workspace in scope has the selected level, so the level is about to fall back and be fetched again.
 * @param tagLevels - Levels from the response to the latest request once it arrived, otherwise the ones stored for the current filters
 * @param canFetchAgain - False offline or after a failed request, when nothing is fetched again and the chart keeps showing what it has
 */
function isTagLevelFallbackPending(tagLevels: InsightsTagLevel[] | undefined, selectedTagLevel: number | undefined, canFetchAgain: boolean): boolean {
    if (!canFetchAgain || !tagLevels || selectedTagLevel === undefined) {
        return false;
    }
    return getFittingTagLevel(selectedTagLevel, tagLevels) !== selectedTagLevel;
}

/**
 * Builds tag levels from the workspaces' tag lists already on the device, for when no stored GetInsights response lists them yet, such as offline right after an update.
 * @returns undefined when none of the workspaces has tag lists on the device
 */
function getCachedTagLevels(policyTags: OnyxCollection<PolicyTagLists>, policyIDs: string[]): InsightsTagLevel[] | undefined {
    const namesByLevel = new Map<number, Set<string>>();
    for (const policyID of policyIDs) {
        const tagLists = getTagLists(policyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`]);
        for (const [index, tagList] of tagLists.entries()) {
            const names = namesByLevel.get(index + 1) ?? new Set<string>();
            if (tagList.name) {
                names.add(tagList.name);
            }
            namesByLevel.set(index + 1, names);
        }
    }
    if (namesByLevel.size === 0) {
        return undefined;
    }
    return [...namesByLevel.entries()].sort(([levelA], [levelB]) => levelA - levelB).map(([level, names]) => ({level, names: [...names]}));
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

/** Finds the tag levels the newest successful Spend request listed for the same workspaces, which can be newer than the ones stored for the current filters. */
function getStoredTagLevels(storedTagLevels: OnyxCollection<InsightsResponseTagLevels>, policyIDs: string[]): InsightsTagLevel[] | undefined {
    const spendKeyPrefix = `${ONYXKEYS.COLLECTION.INSIGHTS_TAG_LEVELS}${CONST.INSIGHTS.DASHBOARD.SPEND}_`;
    const scope = getPolicyScope(policyIDs);
    let newest: InsightsResponseTagLevels | undefined;
    for (const [key, stored] of Object.entries(storedTagLevels ?? {})) {
        if (!key.startsWith(spendKeyPrefix) || !stored?.tagLevels || getQueryPolicyScope(stored.inputQuery) !== scope) {
            continue;
        }
        if (!newest || stored.requestedAt > newest.requestedAt) {
            newest = stored;
        }
    }
    return newest?.tagLevels;
}

export {getCachedTagLevels, getFittingTagLevel, getInsightsTagLevelOptions, getStoredTagLevels, isTagLevelFallbackPending};
export type {InsightsTagLevelOption};

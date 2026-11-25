/**
 * Items a user excluded from an Insights ranking chart. Each chart keeps its own list, saved with the user's other Insights filters,
 * and the list holds item keys, so an item that isn't in the current data matches nothing and stays saved.
 */
import {getTagFilterValue} from '@components/Search/chartGroupByConfig';
import type {GroupedItem, SearchGroupBy} from '@components/Search/types';

import {sanitizeSearchValue} from '@libs/SearchQueryUtils';
import {getLastSearchQuery} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {InsightsExclusions, InsightsExclusionsSearchKey, InsightsGraphKey, SearchFilters} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

/** The Search filter each grouping is narrowed by, which the excluded items are negated on */
const EXCLUSION_FILTER_KEYS: Partial<Record<SearchGroupBy, string>> = {
    [CONST.SEARCH.GROUP_BY.FROM]: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
    [CONST.SEARCH.GROUP_BY.APPROVER]: CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVER,
    [CONST.SEARCH.GROUP_BY.PAID_BY]: CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID_BY,
    [CONST.SEARCH.GROUP_BY.MERCHANT]: CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT,
    [CONST.SEARCH.GROUP_BY.CATEGORY]: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY,
    [CONST.SEARCH.GROUP_BY.TAG]: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG,
};

function getExclusionsSearchKey(graphKey: InsightsGraphKey): InsightsExclusionsSearchKey {
    return `${CONST.INSIGHTS.EXCLUSIONS_SEARCH_KEY_PREFIX}${graphKey}`;
}

/** Reads a chart's excluded item keys from the saved filters. A missing or unreadable entry means nothing is excluded. */
function getExcludedItemKeys(searchFilters: OnyxEntry<SearchFilters>, graphKey: InsightsGraphKey): string[] {
    const query = getLastSearchQuery(searchFilters, getExclusionsSearchKey(graphKey));
    if (!query) {
        return [];
    }
    try {
        const parsed: unknown = JSON.parse(query);
        return Array.isArray(parsed) ? parsed.filter((key): key is string => typeof key === 'string') : [];
    } catch {
        return [];
    }
}

/** Reads the excluded item keys of each given chart, leaving out the charts nothing is excluded from */
function getExclusionsByGraph(searchFilters: OnyxEntry<SearchFilters>, graphKeys: InsightsGraphKey[]): InsightsExclusions {
    const exclusions: InsightsExclusions = {};
    for (const graphKey of graphKeys) {
        const excludedItemKeys = getExcludedItemKeys(searchFilters, graphKey);
        if (excludedItemKeys.length > 0) {
            exclusions[graphKey] = excludedItemKeys;
        }
    }
    return exclusions;
}

/** Returns the key a ranked item is excluded by: the member's account ID, or the merchant, category or tag. Time buckets and other groups can't be excluded. */
function getExclusionItemKey(item: GroupedItem): string | undefined {
    switch (item.groupedBy) {
        case CONST.SEARCH.GROUP_BY.FROM:
        case CONST.SEARCH.GROUP_BY.APPROVER:
        case CONST.SEARCH.GROUP_BY.PAID_BY:
            return String(item.accountID);
        case CONST.SEARCH.GROUP_BY.MERCHANT:
            return item.merchant;
        case CONST.SEARCH.GROUP_BY.CATEGORY:
            return item.category;
        case CONST.SEARCH.GROUP_BY.TAG:
            return item.tag;
        default:
            return undefined;
    }
}

/** Leaves out the excluded items, before the chart ranks and caps what is left */
function removeExcludedItems(items: GroupedItem[] | undefined, excludedItemKeys: string[]): GroupedItem[] | undefined {
    if (!items || excludedItemKeys.length === 0) {
        return items;
    }
    const excludedKeys = new Set(excludedItemKeys);
    return items.filter((item) => {
        const key = getExclusionItemKey(item);
        return key === undefined || !excludedKeys.has(key);
    });
}

/** Builds the query fragment that leaves the excluded items out of a Spend query, so View on Spend matches the chart */
function buildExclusionsFilterQuery(groupBy: SearchGroupBy | undefined, excludedItemKeys: string[]): string {
    const filterKey = groupBy ? EXCLUSION_FILTER_KEYS[groupBy] : undefined;
    if (!filterKey || excludedItemKeys.length === 0) {
        return '';
    }
    const values = excludedItemKeys.map((key) => sanitizeSearchValue(groupBy === CONST.SEARCH.GROUP_BY.TAG ? getTagFilterValue(key) : key));
    return `${CONST.SEARCH.NOT_PREFIX}${filterKey}:${values.join(',')}`;
}

export {buildExclusionsFilterQuery, getExcludedItemKeys, getExclusionItemKey, getExclusionsByGraph, getExclusionsSearchKey, removeExcludedItems};

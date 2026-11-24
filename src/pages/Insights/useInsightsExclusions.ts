/** Reads the items the user excluded from one Insights ranking chart, saved with their other Insights filters. */
import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsGraphKey} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import {getExcludedItemKeys} from './insightsExclusions';

/** Returns the keys of the items the user excluded from a chart, empty for a chart nothing is excluded from. */
function useInsightsExclusions(graphKey: InsightsGraphKey): string[] {
    const [excludedItemKeys = getEmptyArray<string>()] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {selector: (searchFilters) => getExcludedItemKeys(searchFilters, graphKey)});
    return excludedItemKeys;
}

export default useInsightsExclusions;

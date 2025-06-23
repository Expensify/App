import type {SearchDatePreset, SearchFilterKey} from '@components/Search/types';
import CONST from '@src/CONST';
import {SearchDataTypes} from '@src/types/onyx/SearchResults';

function isSearchDatePreset(date: string | undefined): date is SearchDatePreset {
    return Object.values(CONST.SEARCH.DATE_PRESETS).some((datePreset) => datePreset === date);
}

function isFilterSupported(filter: SearchFilterKey, type: SearchDataTypes) {
    return CONST.SEARCH_TYPE_FILTERS_KEYS[type].flat().some((supportedFilter) => supportedFilter === filter);
}

export {isSearchDatePreset, isFilterSupported};

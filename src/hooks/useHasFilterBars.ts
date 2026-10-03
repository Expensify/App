import {useSearchQueryContext} from '@components/Search/SearchContext';

import {hasFiltersChangedFromDefault, NON_SAVABLE_FILTER_KEYS} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasVisibleFilterChipsSelector} from '@src/selectors/AdvancedSearchFiltersForm';

import useOnyx from './useOnyx';

function useHasFilterBars() {
    const [hasVisibleFilterChips = false] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: hasVisibleFilterChipsSelector});
    const {currentSearchQueryJSON, currentDefaultSearchQueryJSON} = useSearchQueryContext();

    if (hasVisibleFilterChips) {
        return true;
    }

    if (currentSearchQueryJSON && currentDefaultSearchQueryJSON) {
        return hasFiltersChangedFromDefault(currentSearchQueryJSON, currentDefaultSearchQueryJSON, NON_SAVABLE_FILTER_KEYS);
    }

    return !!currentSearchQueryJSON?.flatFilters.some((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD);
}

export default useHasFilterBars;

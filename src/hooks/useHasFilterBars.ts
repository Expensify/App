import {useSearchQueryContext} from '@components/Search/SearchContext';

import {isSearchQuerySavable} from '@libs/SearchQueryUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import {hasVisibleFilterChipsSelector} from '@src/selectors/AdvancedSearchFiltersForm';

import useOnyx from './useOnyx';

function useHasFilterBars() {
    const [hasVisibleFilterChips = false] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: hasVisibleFilterChipsSelector});
    const {currentSearchQueryJSON, currentDefaultSearchQueryJSON} = useSearchQueryContext();

    return hasVisibleFilterChips || isSearchQuerySavable(currentSearchQueryJSON, currentDefaultSearchQueryJSON);
}

export default useHasFilterBars;

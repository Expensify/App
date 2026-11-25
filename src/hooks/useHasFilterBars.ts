import {useSearchQueryContext} from '@components/Search/SearchContext';

import {hasFiltersChangedFromDefault, isSearchQuerySavable} from '@libs/SearchQueryUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import {hasVisibleFilterChipsSelector} from '@src/selectors/AdvancedSearchFiltersForm';

import useOnyx from './useOnyx';

function useHasFilterBars() {
    const [hasVisibleFilterChips = false] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: hasVisibleFilterChipsSelector});
    const {currentSearchQueryJSON, currentDefaultSearchQueryJSON} = useSearchQueryContext();

    return (
        hasVisibleFilterChips ||
        isSearchQuerySavable(currentSearchQueryJSON, currentDefaultSearchQueryJSON) ||
        // Reset can still show by itself when validation hides Save and the filter chips.
        (!!currentSearchQueryJSON && !!currentDefaultSearchQueryJSON && hasFiltersChangedFromDefault(currentSearchQueryJSON, currentDefaultSearchQueryJSON))
    );
}

export default useHasFilterBars;

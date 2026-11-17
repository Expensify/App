/** Shares the applied-filter reset behavior between the search header and empty results. */
import {useSearchQueryContext} from '@components/Search/SearchContext';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useShouldReturnTripRooms from '@hooks/useShouldReturnTripRooms';

import {setSearchContext} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {buildQueryStringWithResetFilters, hasFiltersChangedFromDefault} from '@libs/SearchQueryUtils';
import {getFiltersFormWithTripRoomStatuses, mapFiltersFormToLabelValueList, SKIPPED_SEARCH_FILTERS} from '@libs/SearchUIUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

function useSearchFiltersReset() {
    const [searchAdvancedFiltersForm = getEmptyObject<Partial<SearchAdvancedFiltersForm>>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const {translate, localeCompare, dateFnsLocale} = useLocalize();
    const {convertToDisplayStringWithoutCurrency} = useCurrencyListActions();
    const {currentSearchQueryJSON, currentDefaultSearchQueryJSON, currentDefaultSearchQueryFilterKeys} = useSearchQueryContext();
    const shouldReturnTripRooms = useShouldReturnTripRooms(currentSearchQueryJSON?.type);
    const hasDefaultQuery = !!currentDefaultSearchQueryJSON && !!currentSearchQueryJSON;
    const canReset = hasDefaultQuery
        ? hasFiltersChangedFromDefault(currentSearchQueryJSON, currentDefaultSearchQueryJSON)
        : mapFiltersFormToLabelValueList(
              shouldReturnTripRooms ? getFiltersFormWithTripRoomStatuses(searchAdvancedFiltersForm) : searchAdvancedFiltersForm,
              currentDefaultSearchQueryFilterKeys,
              SKIPPED_SEARCH_FILTERS,
              translate,
              dateFnsLocale,
              localeCompare,
              convertToDisplayStringWithoutCurrency,
          ).length > 0;

    const resetFilters = () => {
        if (!currentSearchQueryJSON) {
            return;
        }

        Navigation.setParams({q: buildQueryStringWithResetFilters(currentSearchQueryJSON, currentDefaultSearchQueryJSON), rawQuery: undefined});
        setSearchContext(false);
    };

    return {canReset, resetFilters};
}

export default useSearchFiltersReset;

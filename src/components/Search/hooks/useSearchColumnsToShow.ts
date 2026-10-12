import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {SearchColumnType, SearchQueryJSON} from '@components/Search/types';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsVendorColumnAvailable from '@hooks/useIsVendorColumnAvailable';
import useOnyx from '@hooks/useOnyx';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';

import {isDefaultExpensesQuery, queryHasViolationFilter} from '@libs/SearchQueryUtils';
import {getColumnsToShow, getValidGroupBy} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {columnsSelector} from '@src/selectors/AdvancedSearchFiltersForm';
import type SearchResults from '@src/types/onyx/SearchResults';

import useSearchDataType from './useSearchDataType';

const EMPTY_COLUMNS: SearchColumnType[] = [];

/**
 * The columns the Search table renders for a query and its snapshot.
 *
 * Both the table and the Edit columns picker read this, so the picker's seed can never drift from what is
 * on screen.
 */
function useSearchColumnsToShow(queryJSON: Readonly<SearchQueryJSON> | undefined, searchResults: SearchResults | undefined): SearchColumnType[] {
    const {accountID} = useCurrentUserPersonalDetails();
    const {currentSearchKey} = useSearchQueryContext();
    const {policyForMovingExpensesID} = usePolicyForMovingExpenses();
    const [visibleColumns] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: columnsSelector});
    const isVendorColumnAvailable = useIsVendorColumnAvailable();
    const searchDataType = useSearchDataType(searchResults);

    if (!searchResults?.data) {
        return EMPTY_COLUMNS;
    }

    return getColumnsToShow({
        currentAccountID: accountID,
        data: searchResults.data,
        visibleColumns,
        type: searchDataType,
        groupBy: getValidGroupBy(queryJSON?.groupBy),
        shouldUseStrictDefaultExpenseColumns: currentSearchKey === CONST.SEARCH.SEARCH_KEYS.EXPENSES && !!queryJSON && isDefaultExpensesQuery(queryJSON),
        fallbackPolicyID: policyForMovingExpensesID,
        sortBy: queryJSON?.sortBy,
        shouldShowViolationsColumn: queryHasViolationFilter(queryJSON),
        isVendorColumnAvailable,
    });
}

export default useSearchColumnsToShow;

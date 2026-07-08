import {useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
import type {SearchColumnType, SearchQueryJSON} from '@components/Search/types';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';

import {isDefaultExpensesQuery} from '@libs/SearchQueryUtils';
import {getColumnsToShow} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {columnsSelector} from '@src/selectors/AdvancedSearchFiltersForm';
import type SearchResults from '@src/types/onyx/SearchResults';

const EMPTY_COLUMNS: SearchColumnType[] = [];

/**
 * Columns to render for a scoped Search section view.
 *
 * This computation is identical across every per-type section leaf (expense-report, transaction, chat,
 * task), so it lives here once. It owns the small slice it needs — visible columns and the moving-expenses
 * policy id — and reads account/query/live-data from context.
 *
 * Not memoized: the returned array is stabilized downstream by `columnsToShow` in <Search> (which preserves
 * the previous reference when contents are equal), so a fresh array per render is fine.
 */
function useSearchSectionColumns(queryJSON: Readonly<SearchQueryJSON>, searchResults: SearchResults | undefined): SearchColumnType[] {
    const {accountID} = useCurrentUserPersonalDetails();
    const {currentSearchKey} = useSearchQueryContext();
    const {shouldUseLiveData} = useSearchResultsContext();
    const {policyForMovingExpensesID} = usePolicyForMovingExpenses();
    const [visibleColumns] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: columnsSelector});

    const searchDataType = shouldUseLiveData ? CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT : searchResults?.search?.type;
    if (!searchResults?.data) {
        return EMPTY_COLUMNS;
    }
    return getColumnsToShow({
        currentAccountID: accountID,
        data: searchResults.data,
        visibleColumns,
        type: searchDataType,
        shouldUseStrictDefaultExpenseColumns: currentSearchKey === CONST.SEARCH.SEARCH_KEYS.EXPENSES && isDefaultExpensesQuery(queryJSON),
        fallbackPolicyID: policyForMovingExpensesID,
    });
}

export default useSearchSectionColumns;

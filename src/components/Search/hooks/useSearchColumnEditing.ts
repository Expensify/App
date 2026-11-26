import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {ColumnEditing} from '@components/Search/SortableColumnMenu';
import type {SearchColumnType, SearchCustomColumnIds, SearchQueryJSON} from '@components/Search/types';

import Navigation from '@libs/Navigation/Navigation';
import {getCustomColumns, getRequiredSearchColumns} from '@libs/SearchColumnsUtils';
import {getPinnedColumns, getQueryWithPinnedColumns} from '@libs/SearchPinnedColumnsUtils';
import {buildSearchQueryString, queryHasViolationFilter} from '@libs/SearchQueryUtils';
import {getColumnHiding, getCustomColumnDefault, getValidGroupBy, navigateToSearchWithColumns} from '@libs/SearchUIUtils';

import ROUTES from '@src/ROUTES';

/**
 * @param shownQueryJSON The query whose results the table shows, which decides which of its columns can be hidden
 * @param currentSearchQueryJSON The search the user is on, which a hidden column is taken off. While a filter change loads, the table still shows the
 * previous query's results, and hiding a column from that query would drop the new filter.
 * @param columns The columns the table shows, in order
 */
function useSearchColumnEditing(shownQueryJSON: SearchQueryJSON, currentSearchQueryJSON: SearchQueryJSON, columns: SearchColumnType[]): ColumnEditing {
    const {currentSearchKey} = useSearchQueryContext();

    // A grouped search saves its group columns and the expense columns its groups expand to in the same list, the way the Columns page does.
    const groupBy = getValidGroupBy(shownQueryJSON.groupBy);
    const tableLevelColumns = new Set<SearchColumnType>(getCustomColumns(groupBy ?? shownQueryJSON.type));
    const selectableColumns = new Set<SearchColumnType>([...tableLevelColumns, ...(groupBy ? getCustomColumns(shownQueryJSON.type) : [])]);
    const shownColumns = columns.filter((column): column is SearchCustomColumnIds => tableLevelColumns.has(column));
    // The table drops some saved columns, e.g. Amount debited when no row has one.
    const savedColumns = [shownQueryJSON.columns ?? []].flat().filter((column) => selectableColumns.has(column));
    // A grouped table with none saved shows its default group columns minus the ones it drops, e.g. Amount debited when no group has one.
    // Starting from the defaults keeps those, the way the Columns page does.
    const defaultGroupColumns = groupBy ? getCustomColumnDefault(groupBy) : [];
    // Expense columns are never added here: with none saved, expanded groups derive them from their data.
    const unsavedColumns = [...shownColumns.filter((column) => !defaultGroupColumns.includes(column)), ...defaultGroupColumns];
    const {hidableColumns, getColumnsWithout} = getColumnHiding({
        shownColumns,
        savedColumns,
        requiredColumns: getRequiredSearchColumns(queryHasViolationFilter(shownQueryJSON)),
        unsavedColumns,
        isTableColumn: (column) => tableLevelColumns.has(column),
    });

    const hideColumn = (column: SearchColumnType) => {
        const queryWithoutColumn = {...currentSearchQueryJSON, columns: getColumnsWithout(column)};
        const query = buildSearchQueryString(getQueryWithPinnedColumns(queryWithoutColumn, getPinnedColumns(currentSearchQueryJSON), queryHasViolationFilter(currentSearchQueryJSON)));
        navigateToSearchWithColumns(query, currentSearchKey);
    };

    const editColumns = () => {
        Navigation.navigate(ROUTES.SEARCH_COLUMNS);
    };

    return {hidableColumns, hideColumn, editColumns};
}

export default useSearchColumnEditing;

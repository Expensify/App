import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {ColumnEditing} from '@components/Search/SortableColumnMenu';
import type {SearchColumnType, SearchCustomColumnIds, SearchQueryJSON} from '@components/Search/types';

import Navigation from '@libs/Navigation/Navigation';
import {buildSearchQueryString, queryHasViolationFilter} from '@libs/SearchQueryUtils';
import {getColumnHiding, getCustomColumns, getRequiredSearchColumns, getValidGroupBy, navigateToSearchWithColumns} from '@libs/SearchUIUtils';

import ROUTES from '@src/ROUTES';

/** @param columns The columns the table shows, in order. */
function useSearchColumnEditing(queryJSON: SearchQueryJSON, columns: SearchColumnType[]): ColumnEditing {
    const {currentSearchKey} = useSearchQueryContext();

    const selectableColumns = new Set<SearchColumnType>(getCustomColumns(queryJSON.type));
    const shownColumns = columns.filter((column): column is SearchCustomColumnIds => selectableColumns.has(column));
    // The table drops some saved columns, e.g. Amount debited when no row has one.
    const savedColumns = [queryJSON.columns ?? []].flat().filter((column) => selectableColumns.has(column));
    const {hidableColumns, getColumnsWithout} = getColumnHiding(shownColumns, savedColumns, getRequiredSearchColumns(queryHasViolationFilter(queryJSON)));

    // A grouped table shows only its group columns, so saving what it shows would drop the expense columns its groups expand to.
    const isGrouped = !!getValidGroupBy(queryJSON.groupBy);

    const hideColumn = (column: SearchColumnType) => {
        const query = buildSearchQueryString({...queryJSON, columns: getColumnsWithout(column)});
        navigateToSearchWithColumns(query, currentSearchKey);
    };

    const editColumns = () => {
        Navigation.navigate(ROUTES.SEARCH_COLUMNS);
    };

    return {hidableColumns: isGrouped ? new Set<SearchColumnType>() : hidableColumns, hideColumn, editColumns};
}

export default useSearchColumnEditing;

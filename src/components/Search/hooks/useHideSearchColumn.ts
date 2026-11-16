import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {SearchColumnType, SearchCustomColumnIds, SearchQueryJSON} from '@components/Search/types';

import {buildSearchQueryString, queryHasViolationFilter} from '@libs/SearchQueryUtils';
import {getCustomColumns, getRequiredSearchColumns, getValidGroupBy, navigateToSearchWithColumns} from '@libs/SearchUIUtils';

type HideSearchColumn = {
    /** The shown columns users can hide from their menu. */
    hidableColumns: ReadonlySet<SearchColumnType>;
    hideColumn: (column: SearchColumnType) => void;
};

/** @param columns The columns the table shows, in order. */
function useHideSearchColumn(queryJSON: SearchQueryJSON, columns: SearchColumnType[]): HideSearchColumn {
    const {currentSearchKey} = useSearchQueryContext();

    // A grouped table shows only its group columns, so saving what it shows would drop the expense columns its groups expand to.
    const isGrouped = !!getValidGroupBy(queryJSON.groupBy);
    const selectableColumns = new Set<SearchColumnType>(getCustomColumns(queryJSON.type));
    const shownColumns = columns.filter((column): column is SearchCustomColumnIds => selectableColumns.has(column));
    // The table drops some saved columns, e.g. Amount debited when no row has one, so hiding starts from the saved ones to keep those.
    const savedColumns = [queryJSON.columns ?? []].flat().filter((column) => selectableColumns.has(column));
    const columnsToSave = savedColumns.length > 0 ? savedColumns : shownColumns;
    const requiredColumns = new Set<SearchColumnType>(getRequiredSearchColumns(queryHasViolationFilter(queryJSON)));

    const canHideAnyColumn = !isGrouped && columnsToSave.length > 1;
    const hidableColumns = new Set(canHideAnyColumn ? shownColumns.filter((column) => !requiredColumns.has(column)) : []);

    const hideColumn = (column: SearchColumnType) => {
        const query = buildSearchQueryString({...queryJSON, columns: columnsToSave.filter((columnToSave) => columnToSave !== column)});
        navigateToSearchWithColumns(query, currentSearchKey);
    };

    return {hidableColumns, hideColumn};
}

export default useHideSearchColumn;
export type {HideSearchColumn};

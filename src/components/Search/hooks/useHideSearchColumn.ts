import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {SearchColumnType, SearchCustomColumnIds, SearchQueryJSON} from '@components/Search/types';

import {buildSearchQueryString, queryHasViolationFilter} from '@libs/SearchQueryUtils';
import {getCustomColumnDefault, getCustomColumns, getRequiredSearchColumns, getValidGroupBy, navigateToSearchWithColumns} from '@libs/SearchUIUtils';

type HideSearchColumn = {
    /** The shown columns users can hide from their menu. */
    hidableColumns: ReadonlySet<SearchColumnType>;
    hideColumn: (column: SearchColumnType) => void;
};

/** @param columns The columns the table shows, in order. */
function useHideSearchColumn(queryJSON: SearchQueryJSON, columns: SearchColumnType[]): HideSearchColumn {
    const {currentSearchKey} = useSearchQueryContext();

    // A grouped search saves its group columns and the expense columns its groups expand to in the same list, the way the Columns page does.
    const groupBy = getValidGroupBy(queryJSON.groupBy);
    const tableLevelColumns = new Set<SearchColumnType>(getCustomColumns(groupBy ?? queryJSON.type));
    const selectableColumns = new Set<SearchColumnType>([...tableLevelColumns, ...(groupBy ? getCustomColumns(queryJSON.type) : [])]);
    const shownColumns = columns.filter((column): column is SearchCustomColumnIds => tableLevelColumns.has(column));
    // The table drops some saved columns, e.g. Amount debited when no row has one, so hiding starts from the saved ones to keep those.
    const savedColumns = [queryJSON.columns ?? []].flat().filter((column) => selectableColumns.has(column));
    const savedTableColumns = savedColumns.filter((column) => tableLevelColumns.has(column));
    const hasSavedTableColumns = savedTableColumns.length > 0;
    // A grouped table with none saved shows its default group columns minus the ones it drops, e.g. Amount debited when no group has one.
    // Starting from the defaults keeps those, the way the Columns page does.
    const defaultGroupColumns = groupBy ? getCustomColumnDefault(groupBy) : [];
    const unsavedTableColumns = [...shownColumns.filter((column) => !defaultGroupColumns.includes(column)), ...defaultGroupColumns];
    // With none of this table's columns saved, they join the saved expense columns, so those keep applying to expanded groups.
    // Expense columns are never added here: with none saved, expanded groups derive them from their data.
    const columnsToSave = hasSavedTableColumns ? savedColumns : [...unsavedTableColumns, ...savedColumns];
    const requiredColumns: ReadonlySet<SearchColumnType> = getRequiredSearchColumns(queryHasViolationFilter(queryJSON));

    const canHideAnyColumn = (hasSavedTableColumns ? savedTableColumns : shownColumns).length > 1;
    const hidableColumns = new Set(canHideAnyColumn ? shownColumns.filter((column) => !requiredColumns.has(column)) : []);

    const hideColumn = (column: SearchColumnType) => {
        const query = buildSearchQueryString({...queryJSON, columns: columnsToSave.filter((columnToSave) => columnToSave !== column)});
        navigateToSearchWithColumns(query, currentSearchKey);
    };

    return {hidableColumns, hideColumn};
}

export default useHideSearchColumn;
export type {HideSearchColumn};

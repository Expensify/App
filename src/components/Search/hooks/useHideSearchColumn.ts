import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {SearchColumnType, SearchCustomColumnIds, SearchQueryJSON} from '@components/Search/types';

import usePermissions from '@hooks/usePermissions';
import useShouldReturnTripRooms from '@hooks/useShouldReturnTripRooms';

import {buildSearchQueryString, queryHasViolationFilter} from '@libs/SearchQueryUtils';
import {canEditSearchColumns, getCustomColumns, getRequiredSearchColumns, getValidGroupBy, navigateToSearchWithColumns} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

/** `undefined` for a column users can't hide. */
type GetHideColumnHandler = (column: SearchColumnType) => (() => void) | undefined;

/**
 * `undefined` when the table has no column menus: the beta is off, or users can't pick this type's columns.
 *
 * @param columns The columns the table shows, in order.
 */
function useHideSearchColumn(queryJSON: SearchQueryJSON, columns: SearchColumnType[]): GetHideColumnHandler | undefined {
    const {isBetaEnabled} = usePermissions();
    const {currentSearchKey} = useSearchQueryContext();
    const shouldReturnTripRooms = useShouldReturnTripRooms(queryJSON.type);

    if (!isBetaEnabled(CONST.BETAS.PINNABLE_TABLE_COLUMNS) || !canEditSearchColumns(queryJSON.type, shouldReturnTripRooms)) {
        return undefined;
    }

    // A grouped table shows only its group columns, so saving what it shows would drop the expense columns its groups expand to.
    const isGrouped = !!getValidGroupBy(queryJSON.groupBy);
    const selectableColumns = new Set<SearchColumnType>(getCustomColumns(queryJSON.type));
    const shownColumns = columns.filter((column): column is SearchCustomColumnIds => selectableColumns.has(column));
    // The table drops some saved columns, e.g. Amount debited when no row has one, so hiding starts from the saved ones to keep those.
    const savedColumns = [queryJSON.columns ?? []].flat().filter((column) => selectableColumns.has(column));
    const columnsToSave = savedColumns.length > 0 ? savedColumns : shownColumns;
    const requiredColumns = new Set<SearchColumnType>(getRequiredSearchColumns(queryHasViolationFilter(queryJSON)));

    const getHideColumnHandler: GetHideColumnHandler = (column) => {
        if (isGrouped || !selectableColumns.has(column) || requiredColumns.has(column) || columnsToSave.length <= 1) {
            return undefined;
        }

        return () => {
            const query = buildSearchQueryString({...queryJSON, columns: columnsToSave.filter((columnToSave) => columnToSave !== column)});
            navigateToSearchWithColumns(query, currentSearchKey);
        };
    };

    return getHideColumnHandler;
}

export default useHideSearchColumn;
export type {GetHideColumnHandler};

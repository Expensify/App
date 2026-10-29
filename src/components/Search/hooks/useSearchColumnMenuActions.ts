import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {SearchColumnType, SearchCustomColumnIds, SearchQueryJSON} from '@components/Search/types';

import usePermissions from '@hooks/usePermissions';
import useShouldReturnTripRooms from '@hooks/useShouldReturnTripRooms';

import {buildSearchQueryString, queryHasViolationFilter} from '@libs/SearchQueryUtils';
import {canEditSearchColumns, getCustomColumns, getRequiredSearchColumns, getValidGroupBy, navigateToSearchWithColumns} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

/** What the column menus of a Search table do beyond sorting, which the header already handles. */
type SearchColumnMenuActions = {
    /** `undefined` for a column users can't hide. */
    getHideColumnHandler: (column: SearchColumnType) => (() => void) | undefined;
};

/**
 * `undefined` when the table has no column menus: the beta is off, or users can't pick this type's columns.
 *
 * @param columns The columns the table shows, in order.
 */
function useSearchColumnMenuActions(queryJSON: SearchQueryJSON, columns: SearchColumnType[]): SearchColumnMenuActions | undefined {
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
    const requiredColumns = new Set<SearchColumnType>(getRequiredSearchColumns(queryHasViolationFilter(queryJSON)));

    const getHideColumnHandler = (column: SearchColumnType) => {
        if (isGrouped || !selectableColumns.has(column) || requiredColumns.has(column) || shownColumns.length <= 1) {
            return undefined;
        }

        return () => {
            const query = buildSearchQueryString({...queryJSON, columns: shownColumns.filter((shownColumn) => shownColumn !== column)});
            navigateToSearchWithColumns(query, currentSearchKey);
        };
    };

    return {getHideColumnHandler};
}

export default useSearchColumnMenuActions;
export type {SearchColumnMenuActions};

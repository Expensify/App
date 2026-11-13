/** Reads the column pins a Spend query holds, and turns the column menu's pin and unpin choices into a new query. */
import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {SearchColumnType, SearchQueryJSON} from '@components/Search/types';

import {buildSearchQueryString} from '@libs/SearchQueryUtils';
import type {PinnedColumns, PinnedColumnSide} from '@libs/SearchUIUtils';
import {getPinnedColumns, getQueryWithPinnedColumns, getValidGroupBy, navigateToSearchWithColumns, setColumnPin} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

type PinSearchColumn = {
    /** The query's pins, each edge in the order its columns were pinned. */
    pinnedColumns: PinnedColumns;

    /** The edge a column is pinned to, if any. `undefined` when the table can't pin columns. */
    getPinnedSide: ((column: SearchColumnType) => PinnedColumnSide | undefined) | undefined;

    /** Pins a column to an edge, or unpins it when no edge is given. */
    pinColumn: (column: SearchColumnType, side: PinnedColumnSide | undefined) => void;
};

function usePinSearchColumn(queryJSON: SearchQueryJSON): PinSearchColumn {
    const {currentSearchKey} = useSearchQueryContext();
    const pinnedColumns = getPinnedColumns(queryJSON);

    // A grouped table's columns describe its groups rather than the expenses its pins would apply to.
    const canPinColumns = !getValidGroupBy(queryJSON.groupBy);

    const getPinnedSide = (column: SearchColumnType) => {
        if (pinnedColumns.left.includes(column)) {
            return CONST.SEARCH.PINNED_COLUMN_SIDE.LEFT;
        }
        if (pinnedColumns.right.includes(column)) {
            return CONST.SEARCH.PINNED_COLUMN_SIDE.RIGHT;
        }
        return undefined;
    };

    const pinColumn = (column: SearchColumnType, side: PinnedColumnSide | undefined) => {
        const query = buildSearchQueryString(getQueryWithPinnedColumns(queryJSON, setColumnPin(pinnedColumns, column, side)));
        navigateToSearchWithColumns(query, currentSearchKey);
    };

    return {pinnedColumns, getPinnedSide: canPinColumns ? getPinnedSide : undefined, pinColumn};
}

export default usePinSearchColumn;
export type {PinSearchColumn};

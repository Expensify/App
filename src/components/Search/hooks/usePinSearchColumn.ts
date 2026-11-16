/** Reads the column pins a Spend query holds, and turns the column menu's pin and unpin choices into a new query. */
import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {SearchColumnType, SearchQueryJSON} from '@components/Search/types';

import type {PinnedColumns, PinnedColumnSide} from '@libs/SearchPinnedColumnsUtils';
import {getPinnedColumns, getQueryWithPinnedColumns, setColumnPin} from '@libs/SearchPinnedColumnsUtils';
import {buildSearchQueryString} from '@libs/SearchQueryUtils';
import {getValidGroupBy, navigateToSearchWithColumns} from '@libs/SearchUIUtils';

type PinSearchColumn = {
    /** Whether the table offers pin items. A grouped table's columns describe its groups rather than the expenses its pins would apply to. */
    canPinColumns: boolean;

    /** The query's pins, each edge in the order its columns were pinned. */
    pinnedColumns: PinnedColumns;

    /** Pins a column to an edge, or unpins it when no edge is given. */
    pinColumn: (column: SearchColumnType, side: PinnedColumnSide | undefined) => void;
};

function usePinSearchColumn(queryJSON: SearchQueryJSON): PinSearchColumn {
    const {currentSearchKey} = useSearchQueryContext();
    const pinnedColumns = getPinnedColumns(queryJSON);

    const pinColumn = (column: SearchColumnType, side: PinnedColumnSide | undefined) => {
        const query = buildSearchQueryString(getQueryWithPinnedColumns(queryJSON, setColumnPin(pinnedColumns, column, side)));
        navigateToSearchWithColumns(query, currentSearchKey);
    };

    return {canPinColumns: !getValidGroupBy(queryJSON.groupBy), pinnedColumns, pinColumn};
}

export default usePinSearchColumn;
export type {PinSearchColumn};

/** Reads the column pins a Spend query holds, and turns the column menu's pin and unpin choices into a new query. */
import type {SearchColumnType, SearchQueryJSON} from '@components/Search/types';

import {saveSearchFilters} from '@libs/actions/Search';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchKey} from '@libs/SearchKeyUtils';
import type {PinnedColumns, PinnedColumnSide} from '@libs/SearchPinnedColumnsUtils';
import {getPinnedColumns, getQueryWithPinnedColumns, setColumnPin} from '@libs/SearchPinnedColumnsUtils';
import {buildSearchQueryString, queryHasViolationFilter} from '@libs/SearchQueryUtils';
import {getValidGroupBy} from '@libs/SearchUIUtils';

import type {SearchFullscreenNavigatorParamList} from '@navigation/types';

import {useNavigation} from '@react-navigation/native';

type PinSearchColumn = {
    /** Whether the table offers pin items. A grouped table's columns describe its groups rather than the expenses its pins would apply to. */
    canPinColumns: boolean;

    /** The query's pins, each edge in the order its columns were pinned. */
    pinnedColumns: PinnedColumns;

    /** Pins a column to an edge, or unpins it when no edge is given. */
    pinColumn: (column: SearchColumnType, side: PinnedColumnSide | undefined) => void;
};

function usePinSearchColumn(queryJSON: SearchQueryJSON, searchKey: SearchKey | undefined): PinSearchColumn {
    const navigation = useNavigation<PlatformStackNavigationProp<SearchFullscreenNavigatorParamList>>();
    const pinnedColumns = getPinnedColumns(queryJSON);

    const pinColumn = (column: SearchColumnType, side: PinnedColumnSide | undefined) => {
        const query = buildSearchQueryString(getQueryWithPinnedColumns(queryJSON, setColumnPin(pinnedColumns, column, side), queryHasViolationFilter(queryJSON)));
        // A new route would remount Search and send the search again, though pins only reorder the columns.
        navigation.setParams({q: query, rawQuery: undefined});
        if (searchKey) {
            saveSearchFilters(searchKey, query);
        }
    };

    return {canPinColumns: !getValidGroupBy(queryJSON.groupBy), pinnedColumns, pinColumn};
}

export default usePinSearchColumn;
export type {PinSearchColumn};

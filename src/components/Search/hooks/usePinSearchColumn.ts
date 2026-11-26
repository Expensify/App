/** Reads the column pins a Spend query holds, and turns the column menu's pin and unpin choices into a new query. */
import type {SearchColumnType, SearchQueryJSON} from '@components/Search/types';

import {saveSearchFilters} from '@libs/actions/Search';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchKey} from '@libs/SearchKeyUtils';
import type {PinnedColumns, PinnedColumnSide} from '@libs/SearchPinnedColumnsUtils';
import {getPinnedColumns, getQueryWithPinnedColumns, setColumnPin} from '@libs/SearchPinnedColumnsUtils';
import {isQueryARefinement, markQueryAsRefinement} from '@libs/SearchQueryRefinement';
import {buildSearchQueryString, queryHasViolationFilter} from '@libs/SearchQueryUtils';
import {getValidGroupBy} from '@libs/SearchUIUtils';

import type {SearchFullscreenNavigatorParamList} from '@navigation/types';

import {useNavigation} from '@react-navigation/native';

type PinSearchColumn = {
    /** Whether the table offers pin items. A grouped table's columns describe its groups rather than the expenses its pins would apply to. */
    canPinColumns: boolean;

    /** The current search's pins, each edge in the order its columns were pinned. */
    pinnedColumns: PinnedColumns;

    /** Pins a column to an edge, or unpins it when no edge is given. */
    pinColumn: (column: SearchColumnType, side: PinnedColumnSide | undefined) => void;
};

/**
 * @param shownQueryJSON The query whose results are on screen. The column menu offers Pin left and Pin right only when this query has no
 * Group by. Pins apply to the columns of the plain expense table, while a table grouped by, for example, category shows group columns
 * like Expenses or Total instead.
 * @param currentSearchQueryJSON The query of the search the user is on. It differs from `shownQueryJSON` only while a new search loads
 * and the previous results stay on screen. The pins to draw are read from `currentSearchQueryJSON`, and a pin is added to it, so neither
 * the pins nor anything else the new search changed are lost.
 * @param searchKey The search, like Expenses or a saved search, that the pinned query is saved under, so it reopens with the pins
 */
function usePinSearchColumn(shownQueryJSON: SearchQueryJSON, currentSearchQueryJSON: SearchQueryJSON, searchKey: SearchKey | undefined): PinSearchColumn {
    const navigation = useNavigation<PlatformStackNavigationProp<SearchFullscreenNavigatorParamList>>();
    const pinnedColumns = getPinnedColumns(currentSearchQueryJSON);

    const pinColumn = (column: SearchColumnType, side: PinnedColumnSide | undefined) => {
        const query = buildSearchQueryString(getQueryWithPinnedColumns(currentSearchQueryJSON, setColumnPin(pinnedColumns, column, side), queryHasViolationFilter(currentSearchQueryJSON)));
        // While a new search loads, SearchPage keeps the previous results on screen only if the new query is marked as a refinement.
        // Pinning doesn't change which results load, so when the current query has that mark, the pinned query gets it too. Without it,
        // the previous results would be replaced by a loading skeleton until the new ones arrive.
        if (isQueryARefinement(currentSearchQueryJSON.inputQuery)) {
            markQueryAsRefinement(query);
        }
        // A new route would remount Search and send the search again, though pins only reorder the columns.
        navigation.setParams({q: query, rawQuery: undefined});
        if (searchKey) {
            saveSearchFilters(searchKey, query);
        }
    };

    return {canPinColumns: !getValidGroupBy(shownQueryJSON.groupBy), pinnedColumns, pinColumn};
}

export default usePinSearchColumn;

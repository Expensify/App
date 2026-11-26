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
 * @param shownQueryJSON The query whose results the table shows, which decides whether its columns can be pinned
 * @param currentSearchQueryJSON The search the user is on. While a filter change loads, the table still shows the previous query's results, but the
 * pins to draw and the query a pin changes are this one's, or the pins would drop back and a pin would drop the new filter.
 * @param searchKey The search whose saved filters keep the pins
 */
function usePinSearchColumn(shownQueryJSON: SearchQueryJSON, currentSearchQueryJSON: SearchQueryJSON, searchKey: SearchKey | undefined): PinSearchColumn {
    const navigation = useNavigation<PlatformStackNavigationProp<SearchFullscreenNavigatorParamList>>();
    const pinnedColumns = getPinnedColumns(currentSearchQueryJSON);

    const pinColumn = (column: SearchColumnType, side: PinnedColumnSide | undefined) => {
        const query = buildSearchQueryString(getQueryWithPinnedColumns(currentSearchQueryJSON, setColumnPin(pinnedColumns, column, side), queryHasViolationFilter(currentSearchQueryJSON)));
        // Pins don't change the results, so a pin made while a filter change loads keeps holding the previous results instead of
        // swapping them for a skeleton.
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

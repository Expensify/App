import useGroupedItems from '@components/Search/hooks/useGroupedItems';
import type {ChartView, SearchView} from '@components/Search/types';

import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useTabFocusedRefresh from '@hooks/useTabFocusedRefresh';

import {search} from '@libs/actions/Search';
import {INSIGHTS_CHART_STATE, resolveInsightsChartData} from '@libs/resolveInsightsChartData';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

function isChartView(view: SearchView): view is ChartView {
    return view === CONST.SEARCH.VIEW.BAR || view === CONST.SEARCH.VIEW.LINE || view === CONST.SEARCH.VIEW.PIE;
}

function useInsightData(config: SearchTypeMenuItem | undefined, isConfigResolved = true) {
    const queryJSON = config?.searchQueryJSON;
    const searchKey = config?.key;
    const {groupBy} = queryJSON ?? {};
    const view = queryJSON?.view && isChartView(queryJSON.view) ? queryJSON.view : CONST.SEARCH.VIEW.BAR;

    const [searchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON?.hash}`);

    const {isOffline} = useNetwork();
    // The chart is built from a snapshot that no update patches, so an expense change has to move the key.
    const [spendDataSignature] = useOnyx(ONYXKEYS.DERIVED.SPEND_DATA_SIGNATURE);

    const retry = () => {
        // `search.isLoading` is persisted and may be stale after a reload. Call `search()` again and let it ignore a request that is still running.
        if (!queryJSON || isOffline || !isConfigResolved) {
            return;
        }

        search({
            queryJSON,
            searchKey,
            offset: 0,
            isLoading: false,
            shouldUpdateLastSearchParams: false,
            // The query is a static canned search, so it doesn't need anything OpenApp delivers. Don't sit behind it.
            skipWaitForWrites: true,
        });
    };

    useTabFocusedRefresh(SCREENS.HOME, [queryJSON?.hash, isOffline, isConfigResolved, spendDataSignature?.expenses ?? 0].join('|'), retry);

    const sortedData = useGroupedItems(searchResults, queryJSON);

    const {data, state} = isConfigResolved ? resolveInsightsChartData({snapshot: searchResults, queryJSON, sortedData, isOffline}) : {data: [], state: INSIGHTS_CHART_STATE.LOADING};

    return {
        queryJSON,
        groupBy,
        view,
        data,
        state,
        retry,
    };
}

export default useInsightData;

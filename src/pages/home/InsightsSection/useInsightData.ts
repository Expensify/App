import useGroupedItems from '@components/Search/hooks/useGroupedItems';
import type {ChartView, SearchView} from '@components/Search/types';

import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {search} from '@libs/actions/Search';
import {INSIGHTS_CHART_STATE, resolveInsightsChartData} from '@libs/resolveInsightsChartData';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent} from 'react';

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
    const isFocused = useIsFocused();

    const retry = () => {
        // `search.isLoading` is persisted and may be stale after a reload. Call `search()` again and let it ignore a request that is still running.
        if (!queryJSON || isOffline || !isConfigResolved) {
            return;
        }

        search({
            queryJSON,
            searchKey,
            offset: 0,
            // The backend only returns each group's share of the total when it calculates totals.
            shouldCalculateTotals: true,
            isLoading: false,
            shouldUpdateLastSearchParams: false,
            // The query is a static canned search, so it doesn't need anything OpenApp delivers. Don't sit behind it.
            skipWaitForWrites: true,
        });
    };

    const onConfigChanged = useEffectEvent(() => {
        retry();
    });

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        onConfigChanged();
    }, [queryJSON?.hash, isOffline, isFocused, isConfigResolved]);

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

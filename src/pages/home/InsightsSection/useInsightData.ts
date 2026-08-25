import type {ChartView, GroupedItem, SearchQueryJSON, SearchView} from '@components/Search/types';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {search} from '@libs/actions/Search';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';
import {getSections, getSortedSections, isGroupedItemArray, isSearchDataLoaded} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SearchResults from '@src/types/onyx/SearchResults';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent} from 'react';

const INSIGHT_STATE = {
    OFFLINE: 'offline',
    ERROR: 'error',
    LOADING: 'loading',
    EMPTY: 'empty',
    READY: 'ready',
} as const;

function isChartView(view: SearchView): view is ChartView {
    return view === CONST.SEARCH.VIEW.BAR || view === CONST.SEARCH.VIEW.LINE || view === CONST.SEARCH.VIEW.PIE;
}

function getInsightState(
    isOffline: boolean,
    searchResults: OnyxEntry<SearchResults>,
    queryJSON: SearchQueryJSON | undefined,
    sortedData: GroupedItem[] | undefined,
): ValueOf<typeof INSIGHT_STATE> {
    const isDataLoaded = isSearchDataLoaded(searchResults, queryJSON);

    if (isOffline && !isDataLoaded) {
        return INSIGHT_STATE.OFFLINE;
    }
    if (!isOffline && Object.keys(searchResults?.errors ?? {}).length > 0) {
        return INSIGHT_STATE.ERROR;
    }
    if (!isDataLoaded) {
        return INSIGHT_STATE.LOADING;
    }
    if (!sortedData?.length) {
        return INSIGHT_STATE.EMPTY;
    }
    return INSIGHT_STATE.READY;
}

function useInsightData(config: SearchTypeMenuItem | undefined) {
    const queryJSON = config?.searchQueryJSON;
    const searchKey = config?.key;
    const {groupBy} = queryJSON ?? {};
    const view = queryJSON?.view && isChartView(queryJSON.view) ? queryJSON.view : CONST.SEARCH.VIEW.BAR;

    const {translate, localeCompare, formatPhoneNumber, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {accountID, login} = useCurrentUserPersonalDetails();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [searchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON?.hash}`);

    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();

    const retry = () => {
        // `search.isLoading` is persisted and may be stale after a reload. Call `search()` again and let it ignore a request that is still running.
        if (!queryJSON || isOffline) {
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

    const onConfigChanged = useEffectEvent(() => {
        retry();
    });

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        onConfigChanged();
    }, [queryJSON?.hash, isOffline, isFocused]);

    const sortedSections =
        searchResults?.data && queryJSON && groupBy && login
            ? getSortedSections(
                  queryJSON.type,
                  getSections({
                      dateFnsLocale,
                      type: queryJSON.type,
                      data: searchResults.data,
                      groupBy,
                      queryJSON,
                      currentAccountID: accountID,
                      currentUserEmail: login,
                      translate,
                      formatPhoneNumber,
                      bankAccountList: undefined,
                      conciergeReportID,
                      convertToDisplayString,
                      reportAttributesDerivedValue: undefined,
                  })[0],
                  localeCompare,
                  translate,
                  queryJSON.sortBy,
                  queryJSON.sortOrder,
                  groupBy,
              )
            : undefined;
    const sortedData = sortedSections && isGroupedItemArray(sortedSections) ? sortedSections : undefined;

    const state = getInsightState(isOffline, searchResults, queryJSON, sortedData);

    return {
        queryJSON,
        groupBy,
        view,
        sortedData,
        state,
        retry,
    };
}

export {INSIGHT_STATE, getInsightState};
export default useInsightData;

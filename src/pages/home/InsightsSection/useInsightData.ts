import type {GroupedItem, SearchQueryJSON} from '@components/Search/types';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {search} from '@libs/actions/Search';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';
import {getSections, getSortedSections, isSearchDataLoaded} from '@libs/SearchUIUtils';

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
    HIDDEN: 'hidden',
    READY: 'ready',
} as const;

// Minimum number of data points to show an insight.
const MIN_INSIGHT_DATA_POINTS = 2;

type InsightState = ValueOf<typeof INSIGHT_STATE>;

function getInsightState(isOffline: boolean, searchResults: OnyxEntry<SearchResults>, queryJSON: SearchQueryJSON | undefined, sortedData: GroupedItem[] | undefined): InsightState {
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
    if ((sortedData?.length ?? 0) < MIN_INSIGHT_DATA_POINTS) {
        return INSIGHT_STATE.HIDDEN;
    }
    return INSIGHT_STATE.READY;
}

const CHART_VIEWS = new Set<ValueOf<typeof CONST.SEARCH.VIEW>>([CONST.SEARCH.VIEW.BAR, CONST.SEARCH.VIEW.LINE, CONST.SEARCH.VIEW.PIE]);

function useInsightData(config: SearchTypeMenuItem | undefined) {
    const queryJSON = config?.searchQueryJSON;
    const query = config?.searchQuery;
    const searchKey = config?.key;
    const {groupBy} = queryJSON ?? {};
    // Top spenders doesn't declare a chart view; fall back to a bar chart so the card can render one.
    const view = queryJSON?.view && CHART_VIEWS.has(queryJSON.view) ? queryJSON.view : CONST.SEARCH.VIEW.BAR;

    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {accountID, login} = useCurrentUserPersonalDetails();
    const [searchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON?.hash}`);
    const isSearchLoading = !!searchResults?.search?.isLoading;

    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();

    const onConfigChanged = useEffectEvent(() => {
        if (!queryJSON || isSearchLoading || isOffline) {
            return;
        }

        search({
            queryJSON,
            searchKey,
            offset: 0,
            isOffline,
            isLoading: false,
            shouldUpdateLastSearchParams: false,
        });
    });

    useEffect(() => {
        if (!isFocused) {
            return;
        }
        onConfigChanged();
    }, [config?.hash, isOffline, isFocused]);

    const sortedData =
        searchResults?.data && queryJSON && groupBy && login
            ? (getSortedSections(
                  queryJSON.type,
                  getSections({
                      type: queryJSON.type,
                      data: searchResults.data,
                      groupBy,
                      queryJSON,
                      currentAccountID: accountID,
                      currentUserEmail: login,
                      translate,
                      formatPhoneNumber,
                      bankAccountList: undefined,
                      conciergeReportID: undefined,
                      convertToDisplayString,
                      reportAttributesDerivedValue: undefined,
                  })[0],
                  localeCompare,
                  translate,
                  queryJSON.sortBy,
                  queryJSON.sortOrder,
                  groupBy,
              ) as GroupedItem[])
            : undefined;

    const state = config ? getInsightState(isOffline, searchResults, queryJSON, sortedData) : INSIGHT_STATE.HIDDEN;

    return {
        config,
        query,
        queryJSON,
        groupBy,
        view,
        sortedData,
        state,
    };
}

export {INSIGHT_STATE, getInsightState};
export default useInsightData;

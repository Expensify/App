import {useEffect, useEffectEvent} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {GroupedItem, SearchQueryJSON} from '@components/Search/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {search} from '@libs/actions/Search';
import {getSections, getSortedSections, getSuggestedSearches, isSearchDataLoaded} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SearchResults from '@src/types/onyx/SearchResults';

const SPEND_OVER_TIME_STATE = {
    OFFLINE: 'offline',
    ERROR: 'error',
    LOADING: 'loading',
    HIDDEN: 'hidden',
    READY: 'ready',
} as const;

type SpendOverTimeState = ValueOf<typeof SPEND_OVER_TIME_STATE>;

function getSpendOverTimeState(
    isOffline: boolean,
    searchResults: OnyxEntry<SearchResults>,
    queryJSON: SearchQueryJSON | undefined,
    sortedData: GroupedItem[] | undefined,
): SpendOverTimeState {
    const isDataLoaded = isSearchDataLoaded(searchResults, queryJSON);

    if (isOffline && !isDataLoaded) {
        return SPEND_OVER_TIME_STATE.OFFLINE;
    }
    if (!isOffline && Object.keys(searchResults?.errors ?? {}).length > 0) {
        return SPEND_OVER_TIME_STATE.ERROR;
    }
    if (!isDataLoaded) {
        return SPEND_OVER_TIME_STATE.LOADING;
    }
    if ((sortedData?.length ?? 0) < 2) {
        return SPEND_OVER_TIME_STATE.HIDDEN;
    }
    return SPEND_OVER_TIME_STATE.READY;
}

function useSpendOverTimeData() {
    const config = getSuggestedSearches()[CONST.SEARCH.SEARCH_KEYS.SPEND_OVER_TIME];
    const {searchQueryJSON: queryJSON, searchQuery: query, key: searchKey} = config;
    const {groupBy, view} = queryJSON ?? {};

    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const {accountID, login} = useCurrentUserPersonalDetails();
    const [searchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON?.hash}`);
    const isSearchLoading = !!searchResults?.search?.isLoading;

    const {isOffline} = useNetwork();

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
        onConfigChanged();
    }, [config.hash, isOffline]);

    const sortedData =
        searchResults?.data && queryJSON && groupBy && login
            ? (getSortedSections(
                  queryJSON.type,
                  queryJSON.status,
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
                      allReportMetadata: undefined,
                      conciergeReportID: undefined,
                  })[0],
                  localeCompare,
                  translate,
                  queryJSON.sortBy,
                  queryJSON.sortOrder,
                  groupBy,
              ) as GroupedItem[])
            : undefined;

    const state = getSpendOverTimeState(isOffline, searchResults, queryJSON, sortedData);

    return {
        query,
        queryJSON,
        groupBy,
        view,
        sortedData,
        state,
    };
}

export {SPEND_OVER_TIME_STATE, getSpendOverTimeState};
export default useSpendOverTimeData;

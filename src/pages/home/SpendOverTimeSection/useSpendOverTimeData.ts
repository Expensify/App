import {useEffect, useEffectEvent} from 'react';
import type {GroupedItem} from '@components/Search/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {search} from '@libs/actions/Search';
import {getSections, getSortedSections, getSuggestedSearches, isSearchDataLoaded} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function useSpendOverTimeData() {
    const config = getSuggestedSearches()[CONST.SEARCH.SEARCH_KEYS.SPEND_OVER_TIME];
    const {searchQueryJSON: queryJSON, searchQuery: query, key: searchKey} = config;
    const {groupBy, view} = queryJSON ?? {};

    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const {accountID, login} = useCurrentUserPersonalDetails();
    const [searchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON?.hash}`);
    const isSearchLoading = !!searchResults?.search?.isLoading;

    const {isOffline} = useNetwork();

    const fetchData = () => {
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
    };

    const onConfigChanged = useEffectEvent(fetchData);

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

    const shouldShowOfflineIndicator = isOffline && (!sortedData || sortedData.length === 0);
    const shouldShowErrorIndicator = !isOffline && Object.keys(searchResults?.errors ?? {}).length > 0;
    const shouldShowLoadingIndicator = !shouldShowOfflineIndicator && !shouldShowErrorIndicator && !isSearchDataLoaded(searchResults, queryJSON);

    return {
        query,
        queryJSON,
        groupBy,
        view,
        sortedData,
        shouldShowOfflineIndicator,
        shouldShowErrorIndicator,
        shouldShowLoadingIndicator,
    };
}

export default useSpendOverTimeData;

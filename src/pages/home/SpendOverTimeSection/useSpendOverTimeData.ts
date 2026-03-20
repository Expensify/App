import {useEffect, useLayoutEffect, useRef} from 'react';
import type {GroupedItem} from '@components/Search/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {search} from '@libs/actions/Search';
import {getSections, getSortedSections, isSearchDataLoaded} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {GROUP_BY, QUERY_JSON, SEARCH_KEY} from './config';

function useSpendOverTimeData() {
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const {accountID, login} = useCurrentUserPersonalDetails();
    const {isOffline} = useNetwork();

    const [searchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${QUERY_JSON?.hash}`);

    // We need the snapshot's isLoading in the search effect without subscribing to it (which would cause an infinite loop).
    // useLayoutEffect syncs the ref before useEffect runs. TODO: Replace with useEffectEvent after upgrading to React 19.2.
    const isSearchLoadingRef = useRef(false);

    useLayoutEffect(() => {
        isSearchLoadingRef.current = !!searchResults?.search?.isLoading;
    }, [searchResults?.search?.isLoading]);

    useEffect(() => {
        if (isOffline || !QUERY_JSON || isSearchLoadingRef.current) {
            return;
        }
        search({
            queryJSON: QUERY_JSON,
            searchKey: SEARCH_KEY,
            offset: 0,
            isOffline: false,
            isLoading: false,
            shouldUpdateLastSearchParams: false,
        });
    }, [isOffline]);

    const sortedData =
        searchResults?.data && QUERY_JSON && GROUP_BY && login
            ? (getSortedSections(
                  QUERY_JSON.type,
                  QUERY_JSON.status,
                  getSections({
                      type: QUERY_JSON.type,
                      data: searchResults.data,
                      groupBy: GROUP_BY,
                      queryJSON: QUERY_JSON,
                      currentAccountID: accountID,
                      currentUserEmail: login,
                      translate,
                      formatPhoneNumber,
                      bankAccountList: undefined,
                      allReportMetadata: undefined,
                  })[0],
                  localeCompare,
                  translate,
                  QUERY_JSON.sortBy,
                  QUERY_JSON.sortOrder,
                  GROUP_BY,
              ) as GroupedItem[])
            : undefined;

    const shouldShowOfflineIndicator = isOffline && !sortedData;
    const shouldShowErrorIndicator = !shouldShowOfflineIndicator && Object.keys(searchResults?.errors ?? {}).length > 0;
    const shouldShowLoadingIndicator = !shouldShowOfflineIndicator && !shouldShowErrorIndicator && !isSearchDataLoaded(searchResults, QUERY_JSON);

    return {
        sortedData,
        shouldShowOfflineIndicator,
        shouldShowErrorIndicator,
        shouldShowLoadingIndicator,
    };
}

export default useSpendOverTimeData;

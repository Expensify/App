import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useMemo} from 'react';
import type {GroupedItem} from '@components/Search/types';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {search} from '@libs/actions/Search';
import {getInsightConfig, type InsightTabScreen} from '@libs/InsightsUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getSections, getSortedSections, isSearchDataLoaded} from '@libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function useInsightsChartData(screen: InsightTabScreen) {
    const {searchQuery} = getInsightConfig(screen);
    const queryJSON = useMemo(() => buildSearchQueryJSON(searchQuery), [searchQuery]);
    const {groupBy, view} = queryJSON ?? {};

    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {accountID, login} = useCurrentUserPersonalDetails();
    const [searchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON?.hash}`);
    const isSearchLoading = !!searchResults?.search?.isLoading;

    const {isOffline} = useNetwork();
    const isFocused = useIsFocused();

    const triggerSearch = useEffectEvent(() => {
        if (!queryJSON || isSearchLoading || isOffline) {
            return;
        }
        search({
            queryJSON,
            searchKey: undefined,
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
        triggerSearch();
    }, [queryJSON?.hash, isOffline, isFocused]);

    const sortedData = useMemo<GroupedItem[] | undefined>(() => {
        if (!searchResults?.data || !queryJSON || !groupBy || !login) {
            return undefined;
        }
        const sections = getSections({
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
            convertToDisplayString,
        })[0];
        return getSortedSections(queryJSON.type, queryJSON.status, sections, localeCompare, translate, queryJSON.sortBy, queryJSON.sortOrder, groupBy) as GroupedItem[];
    }, [searchResults?.data, queryJSON, groupBy, login, accountID, translate, formatPhoneNumber, convertToDisplayString, localeCompare]);

    const isLoading = !isSearchDataLoaded(searchResults, queryJSON);

    return {queryJSON, groupBy, view, sortedData, isLoading};
}

export default useInsightsChartData;

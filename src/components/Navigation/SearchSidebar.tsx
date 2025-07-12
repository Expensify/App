import type {ParamListBase} from '@react-navigation/native';
import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import HeaderGap from '@components/HeaderGap';
import {useSearchContext} from '@components/Search/SearchContext';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {isSearchDataLoaded} from '@libs/SearchUIUtils';
import SearchTypeMenu from '@pages/Search/SearchTypeMenu';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {SearchResultsInfo} from '@src/types/onyx/SearchResults';
import NavigationTabBar from './NavigationTabBar';
import NAVIGATION_TABS from './NavigationTabBar/NAVIGATION_TABS';
import TopBar from './TopBar';

type SearchSidebarProps = {
    state: PlatformStackNavigationState<ParamListBase>;
};

function SearchSidebar({state}: SearchSidebarProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const route = state.routes.at(-1);
    const params = route?.params as SearchFullscreenNavigatorParamList[typeof SCREENS.SEARCH.ROOT] | undefined;
    const {lastSearchType, setLastSearchType} = useSearchContext();

    const queryJSON = useMemo(() => {
        if (params?.q) {
            return buildSearchQueryJSON(params.q);
        }
        return undefined;
    }, [params?.q]);

    const currentSearchResultsKey = queryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID;
    const [currentSearchResults] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchResultsKey}`, {canBeMissing: true, selector: (snapshot) => snapshot?.search});
    const [lastNonEmptySearchResults, setLastNonEmptySearchResults] = useState<SearchResultsInfo | undefined>(undefined);

    useEffect(() => {
        if (!currentSearchResults?.type) {
            return;
        }

        setLastSearchType(currentSearchResults.type);
        if (currentSearchResults.hasResults ?? currentSearchResults.hasMoreResults) {
            setLastNonEmptySearchResults(currentSearchResults);
        }
    }, [lastSearchType, queryJSON, setLastSearchType, currentSearchResults]);

    const searchResultsToUse = (currentSearchResults?.hasResults ?? currentSearchResults?.hasMoreResults) ? currentSearchResults : lastNonEmptySearchResults;

    const isDataLoaded = isSearchDataLoaded(searchResultsToUse, queryJSON);

    const shouldShowLoadingState = route?.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT ? false : !isOffline && !isDataLoaded;

    if (shouldUseNarrowLayout) {
        return null;
    }

    return (
        <View style={styles.searchSidebar}>
            <View style={styles.flex1}>
                <HeaderGap />
                <TopBar
                    shouldShowLoadingBar={shouldShowLoadingState}
                    breadcrumbLabel={translate('common.reports')}
                    shouldDisplaySearch={false}
                    shouldDisplayHelpButton={false}
                />
                <SearchTypeMenu queryJSON={queryJSON} />
            </View>
            <NavigationTabBar selectedTab={NAVIGATION_TABS.SEARCH} />
        </View>
    );
}
SearchSidebar.displayName = 'SearchSidebar';
export default SearchSidebar;

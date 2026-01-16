import type {ParamListBase} from '@react-navigation/native';
import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {useSearchContext} from '@components/Search/SearchContext';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import SearchTypeMenu from '@pages/Search/SearchTypeMenu';
import SCREENS from '@src/SCREENS';
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
    const {lastSearchType, setLastSearchType, currentSearchResults} = useSearchContext();

    const queryJSON = useMemo(() => {
        if (!params?.q) {
            return undefined;
        }

        return buildSearchQueryJSON(params.q, params.rawQuery);
    }, [params?.q, params?.rawQuery]);

    useEffect(() => {
        if (!currentSearchResults?.search?.type) {
            return;
        }

        setLastSearchType(currentSearchResults.search.type);
    }, [lastSearchType, queryJSON, setLastSearchType, currentSearchResults?.search?.type]);

    const shouldShowLoadingState = route?.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT ? false : !isOffline && !!currentSearchResults?.search?.isLoading;

    if (shouldUseNarrowLayout) {
        return null;
    }

    return (
        <View style={styles.searchSidebar}>
            <View style={styles.flex1}>
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

export default SearchSidebar;

import type {ParamListBase} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
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
    const {lastSearchType, currentSearchResults, currentSearchQueryJSON} = useSearchStateContext();
    const {setLastSearchType} = useSearchActionsContext();

    const searchType = currentSearchResults?.search?.type;
    const isSearchLoading = currentSearchResults?.search?.isLoading;

    useEffect(() => {
        if (!searchType) {
            return;
        }

        setLastSearchType(searchType);
    }, [lastSearchType, setLastSearchType, searchType]);

    const shouldShowLoadingState = route?.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT ? false : !isOffline && !!isSearchLoading;

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
                <SearchTypeMenu queryJSON={currentSearchQueryJSON} />
            </View>
            <NavigationTabBar selectedTab={NAVIGATION_TABS.SEARCH} />
        </View>
    );
}

export default SearchSidebar;

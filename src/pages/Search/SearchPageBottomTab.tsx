import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import useActiveRoute from '@hooks/useActiveRoute';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import TopBar from '@navigation/AppNavigator/createCustomBottomTabNavigator/TopBar';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SearchQuery} from '@src/types/onyx/SearchResults';
import SearchFilters from './SearchFilters';

function SearchPageBottomTab() {
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const activeRoute = useActiveRoute();
    const styles = useThemeStyles();
    const currentQuery = activeRoute?.params && 'query' in activeRoute.params ? activeRoute?.params?.query : '';
    const policyIDs = activeRoute?.params && 'policyIDs' in activeRoute.params ? (activeRoute?.params?.policyIDs as string) : undefined;
    const query = currentQuery as SearchQuery;
    const isValidQuery = Object.values(CONST.TAB_SEARCH).includes(query);

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH.getRoute(CONST.TAB_SEARCH.ALL));

    return (
        <ScreenWrapper
            testID={SearchPageBottomTab.displayName}
            style={styles.pv0}
        >
            <FullPageNotFoundView
                shouldShow={!isValidQuery}
                onBackButtonPress={handleOnBackButtonPress}
                shouldShowLink={false}
            >
                <TopBar
                    activeWorkspaceID={policyIDs}
                    breadcrumbLabel={translate('common.search')}
                    shouldDisplaySearch={false}
                />
                <SearchFilters query={query} />
                {isSmallScreenWidth && (
                    <Search
                        policyIDs={policyIDs}
                        query={query}
                    />
                )}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchPageBottomTab.displayName = 'SearchPageBottomTab';

export default SearchPageBottomTab;

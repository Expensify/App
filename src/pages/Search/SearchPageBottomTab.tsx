import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import useActiveRoute from '@hooks/useActiveRoute';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import type {CentralPaneNavigatorParamList} from '@libs/Navigation/types';
import TopBar from '@navigation/AppNavigator/createCustomBottomTabNavigator/TopBar';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {SearchQuery} from '@src/types/onyx/SearchResults';
import SearchFilters from './SearchFilters';

type SearchPageProps = StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.SEARCH.CENTRAL_PANE>;

const defaultSearchProps = {
    query: '' as SearchQuery,
    policyIDs: undefined,
    sortBy: CONST.SEARCH_TABLE_COLUMNS.DATE,
    sortOrder: CONST.SORT_ORDER.DESC,
};
function SearchPageBottomTab() {
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const activeRoute = useActiveRoute();
    const styles = useThemeStyles();

    const {
        query: rawQuery,
        policyIDs,
        sortBy,
        sortOrder,
    } = useMemo(() => {
        if (activeRoute?.name !== SCREENS.SEARCH.CENTRAL_PANE || !activeRoute.params) {
            return defaultSearchProps;
        }
        return {...defaultSearchProps, ...activeRoute.params} as SearchPageProps['route']['params'];
    }, [activeRoute]);

    const query = rawQuery as SearchQuery;

    const isValidQuery = Object.values(CONST.TAB_SEARCH).includes(query);

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH.getRoute(CONST.TAB_SEARCH.ALL));

    return (
        <ScreenWrapper
            testID={SearchPageBottomTab.displayName}
            style={styles.pv0}
            offlineIndicatorStyle={styles.mtAuto}
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
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                    />
                )}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchPageBottomTab.displayName = 'SearchPageBottomTab';

export default SearchPageBottomTab;

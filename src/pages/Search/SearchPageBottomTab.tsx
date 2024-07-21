import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo, useState} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import useActiveCentralPaneRoute from '@hooks/useActiveCentralPaneRoute';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import type {CentralPaneScreensParamList} from '@libs/Navigation/types';
import TopBar from '@navigation/AppNavigator/createCustomBottomTabNavigator/TopBar';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {SearchQuery} from '@src/types/onyx/SearchResults';
import SearchFilters from './SearchFilters';

type SearchPageProps = StackScreenProps<CentralPaneScreensParamList, typeof SCREENS.SEARCH.CENTRAL_PANE>;

const defaultSearchProps = {
    query: '' as SearchQuery,
    policyIDs: undefined,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
};
function SearchPageBottomTab() {
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const activeCentralPaneRoute = useActiveCentralPaneRoute();
    const styles = useThemeStyles();
    const [isMobileSelectionModeActive, setIsMobileSelectionModeActive] = useState(false);

    const {
        query: rawQuery,
        policyIDs,
        sortBy,
        sortOrder,
    } = useMemo(() => {
        if (activeCentralPaneRoute?.name !== SCREENS.SEARCH.CENTRAL_PANE || !activeCentralPaneRoute.params) {
            return defaultSearchProps;
        }
        return {...defaultSearchProps, ...activeCentralPaneRoute.params} as SearchPageProps['route']['params'];
    }, [activeCentralPaneRoute]);

    const query = rawQuery as SearchQuery;

    const isValidQuery = Object.values(CONST.SEARCH.TAB).includes(query);

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_CENTRAL_PANE.getRoute(CONST.SEARCH.TAB.ALL));

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
                {!isMobileSelectionModeActive ? (
                    <>
                        <TopBar
                            activeWorkspaceID={policyIDs}
                            breadcrumbLabel={translate('common.search')}
                            shouldDisplaySearch={false}
                        />
                        <SearchFilters query={query} />
                    </>
                ) : (
                    <HeaderWithBackButton
                        title={translate('search.selectMultiple')}
                        onBackButtonPress={() => setIsMobileSelectionModeActive(false)}
                    />
                )}
                {isSmallScreenWidth && (
                    <Search
                        policyIDs={policyIDs}
                        query={query}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        isMobileSelectionModeActive={isMobileSelectionModeActive}
                        setIsMobileSelectionModeActive={setIsMobileSelectionModeActive}
                    />
                )}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchPageBottomTab.displayName = 'SearchPageBottomTab';

export default SearchPageBottomTab;

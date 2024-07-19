import React, {useMemo, useState} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import useActiveBottomTabRoute from '@hooks/useActiveBottomTabRoute';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import {buildSearchQueryJSON} from '@libs/SearchUtils';
import TopBar from '@navigation/AppNavigator/createCustomBottomTabNavigator/TopBar';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SearchStatuses from './SearchStatusMenu';

function SearchPageBottomTab() {
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const activeBottomTabRoute = useActiveBottomTabRoute();
    const styles = useThemeStyles();
    const [isMobileSelectionModeActive, setIsMobileSelectionModeActive] = useState(false);

    // TODO_SEARCH: types for the activeBottomTabRoute are broken.
    const queryJSON = useMemo(() => buildSearchQueryJSON(activeBottomTabRoute.params.cq ?? activeBottomTabRoute.params.q), [activeBottomTabRoute.params]);
    const policyIDs = activeBottomTabRoute.params.policyIDs as string | undefined;

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH.getRoute({query: CONST.SEARCH.TAB.EXPENSE.ALL}));

    // TODO_SEARCH: not sure how we should handle possible undefined for queryJSON.
    if (!queryJSON) {
        return null;
    }

    return (
        <ScreenWrapper
            testID={SearchPageBottomTab.displayName}
            style={styles.pv0}
            offlineIndicatorStyle={styles.mtAuto}
        >
            <FullPageNotFoundView
                shouldShow={false}
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
                        <SearchStatuses status={queryJSON.status} />
                    </>
                ) : (
                    <HeaderWithBackButton
                        title={translate('search.selectMultiple')}
                        onBackButtonPress={() => setIsMobileSelectionModeActive(false)}
                    />
                )}
                {isSmallScreenWidth && (
                    <Search
                        queryJSON={queryJSON}
                        policyIDs={policyIDs}
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

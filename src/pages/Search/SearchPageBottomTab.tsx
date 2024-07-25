import React, {useMemo, useState} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import useActiveCentralPaneRoute from '@hooks/useActiveCentralPaneRoute';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import {buildSearchQueryJSON} from '@libs/SearchUtils';
import TopBar from '@navigation/AppNavigator/createCustomBottomTabNavigator/TopBar';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import SearchStatusMenu from './SearchStatusMenu';

function SearchPageBottomTab() {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const activeCentralPaneRoute = useActiveCentralPaneRoute();
    const styles = useThemeStyles();
    const [isMobileSelectionModeActive, setIsMobileSelectionModeActive] = useState(false);

    const {queryJSON, policyIDs} = useMemo(() => {
        if (!activeCentralPaneRoute || activeCentralPaneRoute.name !== SCREENS.SEARCH.CENTRAL_PANE) {
            return {queryJSON: undefined, policyIDs: undefined};
        }

        // This will be SEARCH_CENTRAL_PANE as we checked that in if.
        const searchParams = activeCentralPaneRoute.params as AuthScreensParamList[typeof SCREENS.SEARCH.CENTRAL_PANE];

        return {
            queryJSON: buildSearchQueryJSON(searchParams.q, searchParams.policyIDs),
            policyIDs: searchParams.policyIDs,
        };
    }, [activeCentralPaneRoute]);

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: CONST.SEARCH.TAB.EXPENSE.ALL}));

    return (
        <ScreenWrapper
            testID={SearchPageBottomTab.displayName}
            style={styles.pv0}
            offlineIndicatorStyle={styles.mtAuto}
        >
            <FullPageNotFoundView
                shouldShow={!queryJSON}
                onBackButtonPress={handleOnBackButtonPress}
                shouldShowLink={false}
            >
                {!isMobileSelectionModeActive && queryJSON ? (
                    <>
                        <TopBar
                            activeWorkspaceID={policyIDs}
                            breadcrumbLabel={translate('common.search')}
                            shouldDisplaySearch={false}
                        />
                        <SearchStatusMenu status={queryJSON.status} />
                    </>
                ) : (
                    <HeaderWithBackButton
                        title={translate('search.selectMultiple')}
                        onBackButtonPress={() => setIsMobileSelectionModeActive(false)}
                    />
                )}
                {shouldUseNarrowLayout && queryJSON && (
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

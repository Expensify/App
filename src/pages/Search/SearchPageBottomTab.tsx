import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import {useSearchContext} from '@components/Search/SearchContext';
import useActiveCentralPaneRoute from '@hooks/useActiveCentralPaneRoute';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import {buildSearchQueryJSON} from '@libs/SearchUtils';
import TopBar from '@navigation/AppNavigator/createCustomBottomTabNavigator/TopBar';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import SearchStatusMenu from './SearchStatusMenu';

function SearchPageBottomTab() {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const activeCentralPaneRoute = useActiveCentralPaneRoute();
    const styles = useThemeStyles();
    const {clearSelectedTransactions} = useSearchContext();
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE);

    const {queryJSON, policyIDs, isCustomQuery} = useMemo(() => {
        if (!activeCentralPaneRoute || activeCentralPaneRoute.name !== SCREENS.SEARCH.CENTRAL_PANE) {
            return {queryJSON: undefined, policyIDs: undefined};
        }

        // This will be SEARCH_CENTRAL_PANE as we checked that in if.
        const searchParams = activeCentralPaneRoute.params as AuthScreensParamList[typeof SCREENS.SEARCH.CENTRAL_PANE];

        return {
            queryJSON: buildSearchQueryJSON(searchParams.q, searchParams.policyIDs),
            policyIDs: searchParams.policyIDs,
            isCustomQuery: searchParams.isCustomQuery,
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
                {!selectionMode?.isEnabled && queryJSON ? (
                    <>
                        <TopBar
                            activeWorkspaceID={policyIDs}
                            breadcrumbLabel={translate('common.search')}
                            shouldDisplaySearch={false}
                        />
                        <SearchStatusMenu
                            isCustomQuery={isCustomQuery}
                            queryJSON={queryJSON}
                        />
                    </>
                ) : (
                    <HeaderWithBackButton
                        title={translate('common.selectMultiple')}
                        onBackButtonPress={() => {
                            clearSelectedTransactions();
                            turnOffMobileSelectionMode();
                        }}
                    />
                )}
                {shouldUseNarrowLayout && queryJSON && (
                    <Search
                        queryJSON={queryJSON}
                        isCustomQuery={isCustomQuery}
                        policyIDs={policyIDs}
                    />
                )}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchPageBottomTab.displayName = 'SearchPageBottomTab';

export default SearchPageBottomTab;

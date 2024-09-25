import React, {useCallback, useEffect, useMemo} from 'react';
import {BackHandler} from 'react-native';
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
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as SearchUtils from '@libs/SearchUtils';
import TopBar from '@navigation/AppNavigator/createCustomBottomTabNavigator/TopBar';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import SearchTypeMenu from './SearchTypeMenu';

function SearchPageBottomTab() {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const activeCentralPaneRoute = useActiveCentralPaneRoute();
    const styles = useThemeStyles();
    const {clearSelectedTransactions} = useSearchContext();
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE);

    const handleBackButtonPress = useCallback(() => {
        if (!selectionMode?.isEnabled) {
            return false;
        }
        if (selectionMode?.isEnabled) {
            clearSelectedTransactions(undefined, true);
            return true;
        }
    }, [selectionMode, clearSelectedTransactions]);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButtonPress);

        return () => backHandler.remove();
    }, [handleBackButtonPress]);

    const searchParams = activeCentralPaneRoute?.params as AuthScreensParamList[typeof SCREENS.SEARCH.CENTRAL_PANE];
    const parsedQuery = SearchUtils.buildSearchQueryJSON(searchParams?.q);
    const policyIDFromSearchQuery = parsedQuery && SearchUtils.getPolicyIDFromSearchQuery(parsedQuery);
    const isActiveCentralPaneRoute = activeCentralPaneRoute?.name === SCREENS.SEARCH.CENTRAL_PANE;
    const queryJSON = isActiveCentralPaneRoute ? parsedQuery : undefined;
    const policyID = isActiveCentralPaneRoute ? policyIDFromSearchQuery : undefined;

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: SearchUtils.buildCannedSearchQuery()}));

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
                            activeWorkspaceID={policyID}
                            breadcrumbLabel={translate('common.search')}
                            shouldDisplaySearch={false}
                            shouldDisplaySearchRouter={shouldUseNarrowLayout}
                            isCustomSearchQuery={shouldUseNarrowLayout && !SearchUtils.isCannedSearchQuery(queryJSON)}
                        />
                        <SearchTypeMenu queryJSON={queryJSON} />
                    </>
                ) : (
                    <HeaderWithBackButton
                        title={translate('common.selectMultiple')}
                        onBackButtonPress={handleBackButtonPress}
                    />
                )}
                {shouldUseNarrowLayout && queryJSON && <Search queryJSON={queryJSON} />}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchPageBottomTab.displayName = 'SearchPageBottomTab';

export default SearchPageBottomTab;

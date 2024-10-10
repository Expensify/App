import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Animated, {clamp, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import {useSearchContext} from '@components/Search/SearchContext';
import SearchStatusBar from '@components/Search/SearchStatusBar';
import useActiveCentralPaneRoute from '@hooks/useActiveCentralPaneRoute';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as SearchUtils from '@libs/SearchUtils';
import TopBar from '@navigation/AppNavigator/createCustomBottomTabNavigator/TopBar';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import SearchSelectionModeHeader from './SearchSelectionModeHeader';
import SearchTypeMenu from './SearchTypeMenu';
import useHandleBackButton from './useHandleBackButton';

const TOO_CLOSE_TO_TOP_DISTANCE = 10;
const TOO_CLOSE_TO_BOTTOM_DISTANCE = 10;
const ANIMATION_DURATION_IN_MS = 300;

function SearchPageBottomTab() {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    const activeCentralPaneRoute = useActiveCentralPaneRoute();
    const styles = useThemeStyles();
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE);
    const {clearSelectedTransactions} = useSearchContext();

    const handleBackButtonPress = useCallback(() => {
        if (!selectionMode?.isEnabled) {
            return false;
        }
        clearSelectedTransactions(undefined, true);
        return true;
    }, [selectionMode, clearSelectedTransactions]);

    useHandleBackButton(handleBackButtonPress);

    const scrollOffset = useSharedValue(0);
    const topBarOffset = useSharedValue<number>(variables.searchHeaderHeight);
    const topBarAnimatedStyle = useAnimatedStyle(() => ({
        top: topBarOffset.value,
    }));

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            const {contentOffset, layoutMeasurement, contentSize} = event;
            if (windowHeight > contentSize.height) {
                return;
            }
            const currentOffset = contentOffset.y;
            const isScrollingDown = currentOffset > scrollOffset.value;
            const distanceScrolled = currentOffset - scrollOffset.value;
            if (isScrollingDown && contentOffset.y > TOO_CLOSE_TO_TOP_DISTANCE) {
                // eslint-disable-next-line react-compiler/react-compiler
                topBarOffset.value = clamp(topBarOffset.value - distanceScrolled, variables.minimalTopBarOffset, variables.searchHeaderHeight);
            } else if (!isScrollingDown && distanceScrolled < 0 && contentOffset.y + layoutMeasurement.height < contentSize.height - TOO_CLOSE_TO_BOTTOM_DISTANCE) {
                topBarOffset.value = withTiming(variables.searchHeaderHeight, {duration: ANIMATION_DURATION_IN_MS});
            }
            scrollOffset.value = currentOffset;
        },
    });

    const searchParams = activeCentralPaneRoute?.params as AuthScreensParamList[typeof SCREENS.SEARCH.CENTRAL_PANE];
    const parsedQuery = SearchUtils.buildSearchQueryJSON(searchParams?.q);
    const searchName = searchParams?.name;
    const policyIDFromSearchQuery = parsedQuery && SearchUtils.getPolicyIDFromSearchQuery(parsedQuery);
    const isActiveCentralPaneRoute = activeCentralPaneRoute?.name === SCREENS.SEARCH.CENTRAL_PANE;
    const queryJSON = isActiveCentralPaneRoute ? parsedQuery : undefined;
    const policyID = isActiveCentralPaneRoute ? policyIDFromSearchQuery : undefined;

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: SearchUtils.buildCannedSearchQuery()}));

    if (!queryJSON) {
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
                />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            testID={SearchPageBottomTab.displayName}
            style={styles.pv0}
            offlineIndicatorStyle={styles.mtAuto}
        >
            {!selectionMode?.isEnabled ? (
                <>
                    <View style={[styles.zIndex10, styles.appBG]}>
                        <TopBar
                            activeWorkspaceID={policyID}
                            breadcrumbLabel={translate('common.search')}
                            shouldDisplaySearch={false}
                            shouldDisplaySearchRouter={shouldUseNarrowLayout}
                            isCustomSearchQuery={shouldUseNarrowLayout && !SearchUtils.isCannedSearchQuery(queryJSON)}
                        />
                    </View>
                    {shouldUseNarrowLayout ? (
                        <Animated.View style={[styles.searchTopBarStyle, topBarAnimatedStyle]}>
                            <SearchTypeMenu
                                queryJSON={queryJSON}
                                searchName={searchName}
                            />
                            <SearchStatusBar
                                type={queryJSON.type}
                                status={queryJSON.status}
                                policyID={queryJSON.policyID}
                                onStatusChange={() => {
                                    topBarOffset.value = withTiming(variables.searchHeaderHeight, {duration: ANIMATION_DURATION_IN_MS});
                                }}
                            />
                        </Animated.View>
                    ) : (
                        <SearchTypeMenu
                            queryJSON={queryJSON}
                            searchName={searchName}
                        />
                    )}
                </>
            ) : (
                <SearchSelectionModeHeader queryJSON={queryJSON} />
            )}
            {shouldUseNarrowLayout && (
                <Search
                    queryJSON={queryJSON}
                    onSearchListScroll={scrollHandler}
                    contentContainerStyle={!selectionMode?.isEnabled ? [styles.searchListContentContainerStyles] : undefined}
                />
            )}
        </ScreenWrapper>
    );
}

SearchPageBottomTab.displayName = 'SearchPageBottomTab';

export default SearchPageBottomTab;

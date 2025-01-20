import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Animated, {clamp, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import {useSearchContext} from '@components/Search/SearchContext';
import SearchPageHeader from '@components/Search/SearchPageHeader/SearchPageHeader';
import SearchStatusBar from '@components/Search/SearchPageHeader/SearchStatusBar';
import useActiveCentralPaneRoute from '@hooks/useActiveCentralPaneRoute';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import {buildCannedSearchQuery, buildSearchQueryJSON, getPolicyIDFromSearchQuery, isCannedSearchQuery} from '@libs/SearchQueryUtils';
import TopBar from '@navigation/AppNavigator/createCustomBottomTabNavigator/TopBar';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import SearchTypeMenu from './SearchTypeMenu';

const TOO_CLOSE_TO_TOP_DISTANCE = 10;
const TOO_CLOSE_TO_BOTTOM_DISTANCE = 10;
const ANIMATION_DURATION_IN_MS = 300;

function SearchPageBottomTab() {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    const activeCentralPaneRoute = useActiveCentralPaneRoute();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE);
    const [narrowSearchRouterActive, setNarrowSearchRouterActive] = useState(false);
    const {clearSelectedTransactions} = useSearchContext();

    const scrollOffset = useSharedValue(0);
    const topBarOffset = useSharedValue<number>(StyleUtils.searchHeaderHeight);
    const topBarAnimatedStyle = useAnimatedStyle(() => ({
        top: topBarOffset.get(),
    }));

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            const {contentOffset, layoutMeasurement, contentSize} = event;
            if (windowHeight > contentSize.height) {
                return;
            }
            const currentOffset = contentOffset.y;
            const isScrollingDown = currentOffset > scrollOffset.get();
            const distanceScrolled = currentOffset - scrollOffset.get();
            if (isScrollingDown && contentOffset.y > TOO_CLOSE_TO_TOP_DISTANCE) {
                topBarOffset.set(clamp(topBarOffset.get() - distanceScrolled, variables.minimalTopBarOffset, StyleUtils.searchHeaderHeight));
            } else if (!isScrollingDown && distanceScrolled < 0 && contentOffset.y + layoutMeasurement.height < contentSize.height - TOO_CLOSE_TO_BOTTOM_DISTANCE) {
                topBarOffset.set(withTiming(StyleUtils.searchHeaderHeight, {duration: ANIMATION_DURATION_IN_MS}));
            }
            scrollOffset.set(currentOffset);
        },
    });

    const onContentSizeChange = useCallback(
        (w: number, h: number) => {
            if (windowHeight <= h) {
                return;
            }
            topBarOffset.set(withTiming(StyleUtils.searchHeaderHeight, {duration: ANIMATION_DURATION_IN_MS}));
        },
        [windowHeight, topBarOffset, StyleUtils.searchHeaderHeight],
    );

    const searchParams = activeCentralPaneRoute?.params as AuthScreensParamList[typeof SCREENS.SEARCH.CENTRAL_PANE];
    const parsedQuery = buildSearchQueryJSON(searchParams?.q);
    const policyIDFromSearchQuery = parsedQuery && getPolicyIDFromSearchQuery(parsedQuery);
    const isActiveCentralPaneRoute = activeCentralPaneRoute?.name === SCREENS.SEARCH.CENTRAL_PANE;
    const queryJSON = isActiveCentralPaneRoute ? parsedQuery : undefined;
    const policyID = isActiveCentralPaneRoute ? policyIDFromSearchQuery : undefined;

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: buildCannedSearchQuery()}));

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

    const shouldDisplayCancelSearch = shouldUseNarrowLayout && (!isCannedSearchQuery(queryJSON) || narrowSearchRouterActive);

    if (shouldUseNarrowLayout) {
        return (
            <ScreenWrapper
                testID={SearchPageBottomTab.displayName}
                style={styles.pv0}
                shouldEnableMaxHeight
                offlineIndicatorStyle={styles.mtAuto}
                headerGapStyles={styles.searchHeaderGap}
            >
                {!selectionMode?.isEnabled ? (
                    <View style={[styles.zIndex10, narrowSearchRouterActive && styles.flex1, styles.mh100]}>
                        <View style={[styles.zIndex10, styles.appBG]}>
                            <TopBar
                                activeWorkspaceID={policyID}
                                breadcrumbLabel={translate('common.reports')}
                                shouldDisplaySearch={false}
                                shouldDisplayCancelSearch={shouldDisplayCancelSearch}
                                narrowSearchRouterActive={narrowSearchRouterActive}
                                deactivateNarrowSearchRouter={() => {
                                    topBarOffset.set(StyleUtils.searchHeaderHeight);
                                    setNarrowSearchRouterActive(false);
                                }}
                            />
                        </View>
                        <View style={[styles.flex1]}>
                            <Animated.View
                                style={[
                                    narrowSearchRouterActive ? styles.narrowSearchRouterInactiveStyle : topBarAnimatedStyle,
                                    !narrowSearchRouterActive && styles.narrowSearchRouterActiveStyle,
                                    styles.narrowSearchHeaderStyle,
                                ]}
                            >
                                <SearchPageHeader
                                    queryJSON={queryJSON}
                                    narrowSearchRouterActive={narrowSearchRouterActive}
                                    activateNarrowSearchRouter={() => {
                                        setNarrowSearchRouterActive(true);
                                    }}
                                />
                                {!narrowSearchRouterActive && (
                                    <SearchStatusBar
                                        queryJSON={queryJSON}
                                        onStatusChange={() => {
                                            topBarOffset.set(withTiming(StyleUtils.searchHeaderHeight, {duration: ANIMATION_DURATION_IN_MS}));
                                        }}
                                    />
                                )}
                            </Animated.View>
                        </View>
                    </View>
                ) : (
                    <>
                        <HeaderWithBackButton
                            title={translate('common.selectMultiple')}
                            onBackButtonPress={() => {
                                clearSelectedTransactions();
                                turnOffMobileSelectionMode();
                            }}
                        />
                        <SearchPageHeader queryJSON={queryJSON} />
                    </>
                )}
                {!narrowSearchRouterActive && (
                    <Search
                        isSearchScreenFocused={isActiveCentralPaneRoute}
                        queryJSON={queryJSON}
                        onSearchListScroll={scrollHandler}
                        onContentSizeChange={onContentSizeChange}
                        contentContainerStyle={!selectionMode?.isEnabled ? [styles.searchListContentContainerStyles] : undefined}
                    />
                )}
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            testID={SearchPageBottomTab.displayName}
            style={styles.pv0}
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            headerGapStyles={styles.searchHeaderGap}
        >
            <View style={[styles.zIndex10, narrowSearchRouterActive && styles.flex1, styles.mh100]}>
                <View style={[styles.zIndex10, styles.appBG]}>
                    <TopBar
                        activeWorkspaceID={policyID}
                        breadcrumbLabel={translate('common.reports')}
                        shouldDisplaySearch={false}
                        shouldDisplayCancelSearch={shouldDisplayCancelSearch}
                        narrowSearchRouterActive={narrowSearchRouterActive}
                        deactivateNarrowSearchRouter={() => {
                            topBarOffset.set(StyleUtils.searchHeaderHeight);
                            setNarrowSearchRouterActive(false);
                        }}
                    />
                </View>
                <SearchTypeMenu queryJSON={queryJSON} />
            </View>
        </ScreenWrapper>
    );
}

SearchPageBottomTab.displayName = 'SearchPageBottomTab';

export default SearchPageBottomTab;

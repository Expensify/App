import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import PulsingView from '@components/PulsingView';
import ReceiptScanDropZone from '@components/ReceiptScanDropZone';
import ScreenWrapper from '@components/ScreenWrapper';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import Search from '@components/Search';
import {useSearchResultsContext, useSearchSelectionActions} from '@components/Search/SearchContext';
import SearchLoadingSkeleton from '@components/Search/SearchLoadingSkeleton';
import SearchPageHeaderNarrow from '@components/Search/SearchPageHeader/SearchPageHeaderNarrow';
import SearchSelectionFooter from '@components/Search/SearchSelectionFooter';
import SearchWithNavigationDeferredMount from '@components/Search/SearchWithNavigationDeferredMount';
import type {SearchParams, SearchQueryJSON} from '@components/Search/types';

import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useEndSubmitNavigationSpans from '@hooks/useEndSubmitNavigationSpans';
import {useLoadingBarVisibility} from '@hooks/useInFlightRequests';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useScrollEventEmitter from '@hooks/useScrollEventEmitter';
import useSearchLoadingState from '@hooks/useSearchLoadingState';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import {isSearchDataLoaded, isSearchPending} from '@libs/SearchUIUtils';
import {getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';

import variables from '@styles/variables';

import {searchInServer} from '@userActions/Report';
import {search} from '@userActions/Search';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SearchResults} from '@src/types/onyx';

import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useRef, useState, useTransition} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {clamp, FadeIn, LayoutAnimationConfig, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

import {SearchActionsBarSwitch, SearchFiltersBarSwitch, SearchPageInputSwitch, SearchTypeMenuSwitch} from './Switches';

const TOO_CLOSE_TO_TOP_DISTANCE = 10;
const TOO_CLOSE_TO_BOTTOM_DISTANCE = 10;
const ANIMATION_DURATION_IN_MS = 300;

type SearchPageNarrowProps = {
    queryJSON?: SearchQueryJSON;
    searchResults?: SearchResults;

    /** The last query whose results resolved. The area renders these, holding them while a new query loads. */
    contentQueryJSON?: SearchQueryJSON;
    contentSearchResults?: SearchResults;

    isMobileSelectionModeEnabled: boolean;
    onSortPressedCallback: () => void;
    /** Overlay rendered above Search content during expense-creation flows (SearchStaticList or null). */
    searchOverlayContent: React.ReactNode;
    /** Callback for Search to signal that real content is ready and the overlay can be dismissed. */
    onSearchContentReady: () => void;
    /** Whether any search filter bars are active (affects content container padding). */
    hasFilterBars: boolean;
    /** Whether the overlay lifecycle is active (used to trigger onSearchLayout independently of overlay content). */
    isOverlayActive: boolean;
};

const tabBarContent = <TabBarBottomContent selectedTab={NAVIGATION_TABS.SEARCH} />;

function SearchPageNarrow({
    queryJSON,
    searchResults,
    contentQueryJSON,
    contentSearchResults,
    isMobileSelectionModeEnabled,
    onSortPressedCallback,
    searchOverlayContent,
    onSearchContentReady,
    hasFilterBars,
    isOverlayActive,
}: SearchPageNarrowProps) {
    const shouldShowLoadingSkeleton = useSearchLoadingState(contentQueryJSON, contentSearchResults);

    // A layer replacing results already on screen renders its hydrate placeholder invisibly, since a skeleton there
    // reads as a flash between two sets of results.
    const previousContentHash = usePrevious(contentQueryJSON?.hash);
    const isReplacingPreviousContent = previousContentHash !== contentQueryJSON?.hash;
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {shouldUseLiveData} = useSearchResultsContext();
    const {isOffline} = useNetwork();

    const shouldShowLoadingBarForReports = useLoadingBarVisibility();
    // Controls the visibility of the educational tooltip based on user scrolling.
    // Hides the tooltip when the user is scrolling and displays it once scrolling stops.
    const triggerScrollEvent = useScrollEventEmitter();
    const route = useRoute();
    const {saveScrollOffset} = useContext(ScrollOffsetContext);
    const receiptDropTargetRef = useRef<View>(null);

    const scrollOffset = useSharedValue(0);
    const topBarOffset = useSharedValue<number>(StyleUtils.searchHeaderDefaultOffset);

    const handleBackButtonPress = useCallback(() => {
        if (!isMobileSelectionModeEnabled) {
            return false;
        }
        topBarOffset.set(StyleUtils.searchHeaderDefaultOffset);
        clearSelectedTransactions();
        turnOffMobileSelectionMode();
        return true;
    }, [isMobileSelectionModeEnabled, clearSelectedTransactions, topBarOffset, StyleUtils.searchHeaderDefaultOffset]);

    useAndroidBackButtonHandler(handleBackButtonPress);

    const topBarAnimatedStyle = useAnimatedStyle(() => ({
        top: topBarOffset.get(),
    }));

    const scrollHandler = useAnimatedScrollHandler(
        {
            onScroll: (event) => {
                scheduleOnRN(triggerScrollEvent);
                const {contentOffset, layoutMeasurement, contentSize} = event;
                if (windowHeight > contentSize.height) {
                    topBarOffset.set(StyleUtils.searchHeaderDefaultOffset);
                    return;
                }
                const currentOffset = contentOffset.y;
                const isScrollingDown = currentOffset > scrollOffset.get();
                const distanceScrolled = currentOffset - scrollOffset.get();

                scheduleOnRN(saveScrollOffset, route, currentOffset);

                if (isScrollingDown && contentOffset.y > TOO_CLOSE_TO_TOP_DISTANCE) {
                    topBarOffset.set(
                        clamp(
                            topBarOffset.get() - distanceScrolled,
                            hasFilterBars ? variables.minimalTopBarWithFiltersOffset : variables.minimalTopBarOffset,
                            StyleUtils.searchHeaderDefaultOffset,
                        ),
                    );
                } else if (!isScrollingDown && distanceScrolled < 0 && contentOffset.y + layoutMeasurement.height < contentSize.height - TOO_CLOSE_TO_BOTTOM_DISTANCE) {
                    topBarOffset.set(withTiming(StyleUtils.searchHeaderDefaultOffset, {duration: ANIMATION_DURATION_IN_MS}));
                }
                scrollOffset.set(currentOffset);
            },
        },
        [hasFilterBars, windowHeight],
    );

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));

    const handleSearchAction = useCallback((value: SearchParams | string) => {
        if (typeof value === 'string') {
            searchInServer(value);
        } else {
            search(value);
        }
    }, []);

    const navigation = useNavigation();
    // When pre-inserted behind the RHP (not focused), always start in static rendering
    // mode so we stay at the lightweight static list until focus arrives. This avoids
    // mounting the heavy Search component while hidden and ensures the deferred write
    // mechanism works correctly: createTransaction registers the write in the next rAF,
    // and the full Search component flushes it when it mounts after focus-driven phase transition.
    const [useStaticRendering] = useState(() => {
        if (!navigation.isFocused()) {
            return true;
        }
        return getPendingSubmitFollowUpAction()?.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH;
    });
    const [isInteractive, setIsInteractive] = useState(!useStaticRendering);
    const [isHeaderInteractive, setIsHeaderInteractive] = useState(!useStaticRendering);
    const isHeaderInteractiveRef = useRef(isHeaderInteractive);
    const [, startTransition] = useTransition();
    useEffect(() => {
        isHeaderInteractiveRef.current = isHeaderInteractive;
    }, [isHeaderInteractive]);
    const onSearchLayout = useCallback(() => {
        if (isHeaderInteractiveRef.current) {
            return;
        }
        startTransition(() => {
            setIsHeaderInteractive(true);
        });
    }, [startTransition]);

    const endSubmitNavigationSpans = useEndSubmitNavigationSpans({requireLayout: true});

    // Wait for focus before transitioning to the full interactive Search component.
    // When pre-inserted behind the RHP, this keeps the page at the lightweight static
    // list phase until it is actually visible, avoiding wasted work and premature span endings.
    // useFocusEffect avoids the extra re-renders that useIsFocused causes on every focus change.
    useFocusEffect(
        useCallback(() => {
            if (isInteractive) {
                return;
            }
            if (!isHeaderInteractive) {
                startTransition(() => {
                    setIsHeaderInteractive(true);
                });
                return;
            }
            startTransition(() => {
                setIsInteractive(true);
            });
        }, [isHeaderInteractive, isInteractive, startTransition]),
    );

    if (!queryJSON || !contentQueryJSON) {
        return (
            <ScreenWrapper
                testID="SearchPageNarrow"
                style={styles.pv0}
                offlineIndicatorStyle={styles.mtAuto}
                shouldShowOfflineIndicator={!!searchResults}
            >
                <FullPageNotFoundView
                    shouldShow={!queryJSON}
                    onBackButtonPress={handleOnBackButtonPress}
                    shouldShowLink={false}
                />
            </ScreenWrapper>
        );
    }

    const isDataLoaded = shouldUseLiveData || isSearchDataLoaded(searchResults, queryJSON);
    // Use the request state because `isLoading` also covers temporary UI loading that should not keep this bar visible.
    const shouldShowLoadingState = !isOffline && (!isDataLoaded || isSearchPending(searchResults));
    const contentContainerStyle = !isMobileSelectionModeEnabled ? styles.searchListContentContainerStyles(hasFilterBars) : undefined;

    const shouldRenderLayoutProbe = (isOverlayActive || !isHeaderInteractive) && !searchOverlayContent;

    return (
        <View
            ref={receiptDropTargetRef}
            style={styles.flex1}
        >
            <ScreenWrapper
                testID="SearchPageNarrow"
                shouldEnableMaxHeight
                offlineIndicatorStyle={styles.mtAuto}
                shouldShowOfflineIndicator={!!searchResults}
                bottomContent={tabBarContent}
                bottomContentStyle={styles.overflowVisible}
            >
                <View style={[styles.flex1, styles.overflowHidden]}>
                    {!isMobileSelectionModeEnabled ? (
                        <View style={[StyleUtils.getSearchPageNarrowHeaderStyles(), styles.mh100]}>
                            <View style={[styles.zIndex10, styles.appBG]}>
                                <SearchPageHeaderNarrow
                                    queryJSON={queryJSON}
                                    shouldShowLoadingBar={shouldShowLoadingState || shouldShowLoadingBarForReports}
                                    isMobileSelectionModeEnabled={false}
                                />
                            </View>
                            <View style={[styles.flex1]}>
                                <Animated.View style={[topBarAnimatedStyle, styles.narrowSearchRouterInactiveStyle, styles.flex1, styles.appBG, styles.searchTopBarZIndexStyle]}>
                                    <PulsingView
                                        shouldPulse={!isHeaderInteractive}
                                        style={styles.flex1}
                                        wrapperStyle={[styles.flex1, styles.appBG]}
                                    >
                                        <SearchTypeMenuSwitch
                                            showStatic={!isHeaderInteractive}
                                            queryJSON={queryJSON}
                                        />
                                        <View style={[styles.flex1, styles.flexRow, styles.pt1, styles.mh5, styles.mb4, styles.gap3]}>
                                            <SearchPageInputSwitch
                                                showStatic={!isHeaderInteractive}
                                                queryJSON={queryJSON}
                                                onFocus={() => topBarOffset.set(StyleUtils.searchHeaderDefaultOffset)}
                                            />
                                            <SearchActionsBarSwitch
                                                showStatic={!isHeaderInteractive}
                                                queryJSON={queryJSON}
                                                searchResults={searchResults}
                                                onSort={onSortPressedCallback}
                                            />
                                        </View>
                                        <SearchFiltersBarSwitch
                                            showStatic={!isHeaderInteractive}
                                            queryJSON={queryJSON}
                                        />
                                    </PulsingView>
                                </Animated.View>
                            </View>
                        </View>
                    ) : (
                        <>
                            <HeaderWithBackButton
                                title={translate('common.selectMultiple')}
                                onBackButtonPress={() => {
                                    topBarOffset.set(StyleUtils.searchHeaderDefaultOffset);
                                    clearSelectedTransactions();
                                    turnOffMobileSelectionMode();
                                }}
                            />
                            <SearchPageHeaderNarrow
                                queryJSON={queryJSON}
                                shouldShowLoadingBar={false}
                                isMobileSelectionModeEnabled
                            />
                        </>
                    )}
                    <View style={[styles.flex1]}>
                        {useStaticRendering && (
                            <>
                                {isInteractive && (
                                    <Search
                                        searchResults={contentSearchResults}
                                        queryJSON={contentQueryJSON}
                                        key={contentQueryJSON.hash}
                                        contentContainerStyle={contentContainerStyle}
                                        handleSearch={handleSearchAction}
                                        isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                                        onSearchListScroll={scrollHandler}
                                        onDestinationVisible={endSubmitNavigationSpans}
                                        onContentReady={onSearchContentReady}
                                        hasFilterBars={hasFilterBars}
                                    />
                                )}
                                {shouldRenderLayoutProbe && <View onLayout={onSearchLayout} />}
                                {!!searchOverlayContent && (
                                    <View
                                        style={[StyleSheet.absoluteFill, styles.appBG]}
                                        onLayout={onSearchLayout}
                                    >
                                        {searchOverlayContent}
                                    </View>
                                )}
                            </>
                        )}
                        {!useStaticRendering && (
                            <>
                                {/* skipEntering keeps the delayed fade off the very first mount, so opening Search cold paints immediately. */}
                                <LayoutAnimationConfig skipEntering>
                                    {/* Keyed on the resolved query, so this only remounts once the new results arrive — the previous ones
                                        stay on screen until then, and the new ones fade in. Absolutely filled so it never shares the
                                        parent's column layout with the layer it replaces. */}
                                    <Animated.View
                                        key={contentQueryJSON.hash}
                                        entering={FadeIn.duration(CONST.SEARCH.ANIMATION.FADE_DURATION)}
                                        style={StyleSheet.absoluteFill}
                                    >
                                        {shouldShowLoadingSkeleton ? (
                                            <SearchLoadingSkeleton containerStyle={styles.searchListContentContainerStyles(hasFilterBars)} />
                                        ) : (
                                            <SearchWithNavigationDeferredMount
                                                isReplacingContent={isReplacingPreviousContent}
                                                searchResults={contentSearchResults}
                                                queryJSON={contentQueryJSON}
                                                onSearchListScroll={scrollHandler}
                                                contentContainerStyle={contentContainerStyle}
                                                handleSearch={handleSearchAction}
                                                isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                                                onDestinationVisible={endSubmitNavigationSpans}
                                                onContentReady={onSearchContentReady}
                                                hasFilterBars={hasFilterBars}
                                            />
                                        )}
                                    </Animated.View>
                                </LayoutAnimationConfig>
                                {shouldRenderLayoutProbe && <View onLayout={onSearchLayout} />}
                                {!!searchOverlayContent && (
                                    <View
                                        style={[StyleSheet.absoluteFill, styles.appBG]}
                                        onLayout={onSearchLayout}
                                    >
                                        {searchOverlayContent}
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                    <SearchSelectionFooter searchResults={searchResults} />
                </View>
            </ScreenWrapper>
            {(!useStaticRendering || isHeaderInteractive) && (
                <ReceiptScanDropZone
                    targetRef={receiptDropTargetRef}
                    dropWrapperStyle={{marginBottom: variables.bottomTabHeight}}
                />
            )}
        </View>
    );
}

export default SearchPageNarrow;

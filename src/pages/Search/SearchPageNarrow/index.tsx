import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import React, {useCallback, useContext, useEffect, useRef, useState, useTransition} from 'react';
import {StyleSheet, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Animated, {clamp, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import {useFullScreenBlockingViewActions} from '@components/FullScreenBlockingViewContextProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TabBarBottomContent from '@components/Navigation/TabBarBottomContent';
import PulsingView from '@components/PulsingView';
import ReceiptScanDropZone from '@components/ReceiptScanDropZone';
import ScreenWrapper from '@components/ScreenWrapper';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import Search from '@components/Search';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import SearchLoadingSkeleton from '@components/Search/SearchLoadingSkeleton';
import SearchPageFooter from '@components/Search/SearchPageFooter';
import SearchPageHeaderNarrow from '@components/Search/SearchPageHeader/SearchPageHeaderNarrow';
import {SKIPPED_FILTERS} from '@components/Search/SearchPageHeader/useSearchFiltersBar';
import SearchStaticList from '@components/Search/SearchStaticList';
import type {SearchParams, SearchQueryJSON} from '@components/Search/types';
import useAndroidBackButtonHandler from '@hooks/useAndroidBackButtonHandler';
import useEndSubmitNavigationSpans from '@hooks/useEndSubmitNavigationSpans';
import useLoadingBarVisibility from '@hooks/useLoadingBarVisibility';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useScrollEventEmitter from '@hooks/useScrollEventEmitter';
import useSearchLoadingState from '@hooks/useSearchLoadingState';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import {isSearchDataLoaded, shouldShowFilter} from '@libs/SearchUIUtils';
import {getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import variables from '@styles/variables';
import {searchInServer} from '@userActions/Report';
import {search} from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {SearchAdvancedFiltersKey} from '@src/types/form/SearchAdvancedFiltersForm';
import type {SearchResults} from '@src/types/onyx';
import type {SearchResultsInfo} from '@src/types/onyx/SearchResults';
import {SearchActionsBarSwitch, SearchFiltersBarSwitch, SearchPageInputSwitch, SearchTypeMenuSwitch} from './Switches';

const TOO_CLOSE_TO_TOP_DISTANCE = 10;
const TOO_CLOSE_TO_BOTTOM_DISTANCE = 10;
const ANIMATION_DURATION_IN_MS = 300;

type SearchPageNarrowProps = {
    queryJSON?: SearchQueryJSON;
    metadata?: SearchResultsInfo;
    searchResults?: SearchResults;
    isMobileSelectionModeEnabled: boolean;
    footerData: {
        count: number | undefined;
        total: number | undefined;
        currency: string | undefined;
    };
    shouldShowFooter: boolean;
    onSortPressedCallback: () => void;
};

function hasFilterBarsSelector(searchAdvancedFiltersForm: OnyxEntry<SearchAdvancedFiltersForm>) {
    const type = searchAdvancedFiltersForm?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE;
    return !!Object.entries(searchAdvancedFiltersForm ?? {}).filter(([key, value]) => shouldShowFilter(SKIPPED_FILTERS, key as SearchAdvancedFiltersKey, value, type)).length;
}

const tabBarContent = <TabBarBottomContent selectedTab={NAVIGATION_TABS.SEARCH} />;

function SearchPageNarrow({queryJSON, searchResults, isMobileSelectionModeEnabled, metadata, footerData, shouldShowFooter, onSortPressedCallback}: SearchPageNarrowProps) {
    const shouldShowLoadingSkeleton = useSearchLoadingState(queryJSON, searchResults);
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {clearSelectedTransactions} = useSearchActionsContext();
    const {shouldUseLiveData} = useSearchStateContext();
    const [searchRouterListVisible, setSearchRouterListVisible] = useState(false);
    const {isOffline} = useNetwork();

    const shouldShowLoadingBarForReports = useLoadingBarVisibility();
    // Controls the visibility of the educational tooltip based on user scrolling.
    // Hides the tooltip when the user is scrolling and displays it once scrolling stops.
    const triggerScrollEvent = useScrollEventEmitter();
    const route = useRoute();
    const {saveScrollOffset} = useContext(ScrollOffsetContext);
    const receiptDropTargetRef = useRef<View>(null);

    const [searchRequestResponseStatusCode, setSearchRequestResponseStatusCode] = useState<number | null>(null);
    const [hasFilterBars = false] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: hasFilterBarsSelector});

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

    const shouldDisplayCancelSearch = shouldUseNarrowLayout && searchRouterListVisible;
    const cancelSearchCallback = useCallback(() => {
        setSearchRouterListVisible(false);
    }, []);

    const handleSearchAction = useCallback((value: SearchParams | string) => {
        if (typeof value === 'string') {
            searchInServer(value);
        } else {
            search(value)?.then((jsonCode) => setSearchRequestResponseStatusCode(Number(jsonCode ?? 0)));
        }
    }, []);

    const {addRouteKey, removeRouteKey} = useFullScreenBlockingViewActions();
    useEffect(() => {
        if (!searchRouterListVisible) {
            return;
        }

        addRouteKey(route.key);

        return () => removeRouteKey(route.key);
    }, [addRouteKey, removeRouteKey, route.key, searchRouterListVisible]);

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
    const [isSearchReady, setIsSearchReady] = useState(!useStaticRendering);
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

    const onSearchContentReady = useCallback(() => {
        setIsSearchReady(true);
    }, []);

    const endSubmitNavigationSpans = useEndSubmitNavigationSpans({requireLayout: true});

    // Wait for focus before transitioning to the full interactive Search component.
    // When pre-inserted behind the RHP, this keeps the page at the lightweight static
    // list phase until it is actually visible, avoiding wasted work and premature span endings.
    // useFocusEffect avoids the extra re-renders that useIsFocused causes on every focus change.
    useFocusEffect(
        useCallback(() => {
            if (!isHeaderInteractive || isInteractive) {
                return;
            }
            startTransition(() => {
                setIsInteractive(true);
            });
        }, [isHeaderInteractive, isInteractive, startTransition]),
    );

    if (!queryJSON) {
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
    const shouldShowLoadingState = !isOffline && (!isDataLoaded || !!metadata?.isLoading);
    const contentContainerStyle = !isMobileSelectionModeEnabled ? styles.searchListContentContainerStyles(hasFilterBars) : undefined;

    // Overlay pattern: SearchStaticList renders as an absolute-fill sibling on
    // top of Search, so its native views are never unmounted by a tree-structure
    // swap. Search mounts behind the overlay when isInteractive flips, and once
    // Search signals readiness (onContentReady -> onLayout), the overlay is removed.
    const showStaticOverlay = useStaticRendering && !isSearchReady;

    const renderStaticSearchList = () => (
        <>
            {isInteractive && (
                <Search
                    searchResults={searchResults}
                    queryJSON={queryJSON}
                    key={queryJSON.hash}
                    contentContainerStyle={contentContainerStyle}
                    handleSearch={handleSearchAction}
                    isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                    onSearchListScroll={scrollHandler}
                    searchRequestResponseStatusCode={searchRequestResponseStatusCode}
                    onDestinationVisible={endSubmitNavigationSpans}
                    onContentReady={onSearchContentReady}
                    hasFilterBars={hasFilterBars}
                />
            )}
            {showStaticOverlay && (
                <View style={[StyleSheet.absoluteFill, styles.appBG]}>
                    <SearchStaticList
                        searchResults={searchResults}
                        queryJSON={queryJSON}
                        contentContainerStyle={contentContainerStyle}
                        onLayout={onSearchLayout}
                        onDestinationVisible={endSubmitNavigationSpans}
                    />
                </View>
            )}
        </>
    );

    const renderDynamicSearchList = () => {
        if (shouldShowLoadingSkeleton) {
            return (
                <SearchLoadingSkeleton
                    containerStyle={styles.searchListContentContainerStyles(hasFilterBars)}
                    reasonAttributes={{
                        context: 'SearchPage',
                        isOffline,
                        isDataLoaded,
                        isSearchLoading: !!searchResults?.search?.isLoading,
                        hasEmptyData: Array.isArray(searchResults?.data) && searchResults?.data.length === 0,
                        hasErrors: Object.keys(searchResults?.errors ?? {}).length > 0 && !isOffline,
                        hasPendingResponse: searchRequestResponseStatusCode === null,
                        shouldUseLiveData,
                    }}
                />
            );
        }

        return (
            <Search
                searchResults={searchResults}
                queryJSON={queryJSON}
                key={queryJSON.hash}
                onSearchListScroll={scrollHandler}
                contentContainerStyle={contentContainerStyle}
                handleSearch={handleSearchAction}
                isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                searchRequestResponseStatusCode={searchRequestResponseStatusCode}
                onDestinationVisible={endSubmitNavigationSpans}
                hasFilterBars={hasFilterBars}
            />
        );
    };

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
                        <View style={[StyleUtils.getSearchPageNarrowHeaderStyles(), searchRouterListVisible && styles.flex1, styles.mh100]}>
                            <View style={[styles.zIndex10, styles.appBG]}>
                                <SearchPageHeaderNarrow
                                    queryJSON={queryJSON}
                                    shouldShowLoadingBar={shouldShowLoadingState || shouldShowLoadingBarForReports}
                                    isMobileSelectionModeEnabled={false}
                                    cancelSearch={shouldDisplayCancelSearch ? cancelSearchCallback : undefined}
                                />
                            </View>
                            <View style={[styles.flex1]}>
                                <Animated.View
                                    style={[
                                        topBarAnimatedStyle,
                                        !searchRouterListVisible && styles.narrowSearchRouterInactiveStyle,
                                        styles.flex1,
                                        styles.appBG,
                                        styles.searchTopBarZIndexStyle,
                                    ]}
                                >
                                    <PulsingView
                                        shouldPulse={!isHeaderInteractive}
                                        style={styles.flex1}
                                        wrapperStyle={[styles.flex1, styles.appBG]}
                                    >
                                        <SearchTypeMenuSwitch
                                            showStatic={!isHeaderInteractive}
                                            queryJSON={queryJSON}
                                            onTabPress={() => {
                                                setSearchRouterListVisible(false);
                                            }}
                                        />
                                        <View style={[styles.flex1, styles.flexRow, styles.pt1]}>
                                            <SearchPageInputSwitch
                                                showStatic={!isHeaderInteractive}
                                                queryJSON={queryJSON}
                                                searchRouterListVisible={searchRouterListVisible}
                                                hideSearchRouterList={() => {
                                                    setSearchRouterListVisible(false);
                                                }}
                                                onSearchRouterFocus={() => {
                                                    topBarOffset.set(StyleUtils.searchHeaderDefaultOffset);
                                                    setSearchRouterListVisible(true);
                                                }}
                                                handleSearch={handleSearchAction}
                                                skipSkeleton={useStaticRendering}
                                            />
                                            {!searchRouterListVisible && (
                                                <SearchActionsBarSwitch
                                                    showStatic={!isHeaderInteractive}
                                                    queryJSON={queryJSON}
                                                    searchResults={searchResults}
                                                    onSort={onSortPressedCallback}
                                                />
                                            )}
                                        </View>
                                        {!searchRouterListVisible && (
                                            <SearchFiltersBarSwitch
                                                showStatic={!isHeaderInteractive}
                                                queryJSON={queryJSON}
                                            />
                                        )}
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
                    {!searchRouterListVisible && (
                        <View style={[styles.flex1]}>
                            {useStaticRendering && renderStaticSearchList()}
                            {!useStaticRendering && renderDynamicSearchList()}
                        </View>
                    )}
                    {shouldShowFooter && !searchRouterListVisible && (
                        <SearchPageFooter
                            count={footerData.count}
                            total={footerData.total}
                            currency={footerData.currency}
                        />
                    )}
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

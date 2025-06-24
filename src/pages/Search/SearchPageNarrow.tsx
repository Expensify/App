import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Animated, {clamp, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TopBar from '@components/Navigation/TopBar';
import ScreenWrapper from '@components/ScreenWrapper';
import Search from '@components/Search';
import SearchFiltersBar from '@components/Search/SearchPageHeader/SearchFiltersBar';
import SearchPageHeader from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {SearchHeaderOptionValue} from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {SearchParams, SearchQueryJSON} from '@components/Search/types';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import useHandleBackButton from '@hooks/useHandleBackButton';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useScrollEventEmitter from '@hooks/useScrollEventEmitter';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery, isCannedSearchQuery} from '@libs/SearchQueryUtils';
import {isSearchDataLoaded} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import {searchInServer} from '@userActions/Report';
import {search} from '@userActions/Search';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchResults} from '@src/types/onyx';
import {useSearchContext} from '@components/Search/SearchContext';

const TOO_CLOSE_TO_TOP_DISTANCE = 10;
const TOO_CLOSE_TO_BOTTOM_DISTANCE = 10;
const ANIMATION_DURATION_IN_MS = 300;

type SearchPageNarrowProps = {
    queryJSON?: SearchQueryJSON;
    headerButtonsOptions?: Array<DropdownOption<SearchHeaderOptionValue>>;
    currentSearchResults?: SearchResults;
    lastNonEmptySearchResults?: SearchResults;
};

const SearchPageNarrow = memo(function SearchPageNarrow({queryJSON, headerButtonsOptions = [], currentSearchResults, lastNonEmptySearchResults}: SearchPageNarrowProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isOffline} = useNetwork();
    const {clearSelectedTransactions} = useSearchContext();

    const [selectionMode] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE, {
        canBeMissing: true,
        selector: (data) => data?.isEnabled,
    });

    const [componentState, setComponentState] = useState({
        searchRouterListVisible: false,
        shouldRenderFiltersBar: false,
        shouldRenderSearch: false,
        isAnimationSystemReady: false,
    });

    const searchResults = useMemo(() => {
        return (currentSearchResults?.data && Array.isArray(currentSearchResults.data)) ? currentSearchResults : lastNonEmptySearchResults;
    }, [currentSearchResults?.data, lastNonEmptySearchResults]);

    const scrollEventEmitter = useScrollEventEmitter();
    const triggerScrollEvent = componentState.isAnimationSystemReady ? scrollEventEmitter : () => {};

    const scrollOffset = useSharedValue(0);
    const topBarOffset = useSharedValue<number>(0);
    
    const updateTopBarOffsetRef = useRef(() => {
        topBarOffset.set(StyleUtils.searchHeaderDefaultOffset);
    });
    
    useEffect(() => {
        if (componentState.isAnimationSystemReady) {
            updateTopBarOffsetRef.current();
        }
    }, [componentState.isAnimationSystemReady]);

    const topBarAnimatedStyle = useAnimatedStyle(() => ({
        top: topBarOffset.get(),
    }));

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            if (!componentState.isAnimationSystemReady) return;
            
            runOnJS(triggerScrollEvent)();
            const {contentOffset, layoutMeasurement, contentSize} = event;
            if (windowHeight > contentSize.height) {
                return;
            }
            const currentOffset = contentOffset.y;
            const isScrollingDown = currentOffset > scrollOffset.get();
            const distanceScrolled = currentOffset - scrollOffset.get();

            if (isScrollingDown && contentOffset.y > TOO_CLOSE_TO_TOP_DISTANCE) {
                topBarOffset.set(clamp(topBarOffset.get() - distanceScrolled, variables.minimalTopBarOffset, StyleUtils.searchHeaderDefaultOffset));
            } else if (!isScrollingDown && distanceScrolled < 0 && contentOffset.y + layoutMeasurement.height < contentSize.height - TOO_CLOSE_TO_BOTTOM_DISTANCE) {
                topBarOffset.set(withTiming(StyleUtils.searchHeaderDefaultOffset, {duration: ANIMATION_DURATION_IN_MS}));
            }
            scrollOffset.set(currentOffset);
        },
    });

    useEffect(() => {
        let isMounted = true;
        
        const staggeredUpdates = async () => {
            await new Promise(resolve => requestAnimationFrame(resolve));
            
            if (!isMounted) return;
            
            setComponentState(prev => ({
                ...prev,
                shouldRenderFiltersBar: true,
            }));
            
            const searchUpdate = InteractionManager.runAfterInteractions(() => {
                if (!isMounted) return;
                
                setComponentState(prev => ({
                    ...prev,
                    shouldRenderSearch: true,
                    isAnimationSystemReady: true,
                }));
            });
            
            return () => searchUpdate.cancel();
        };
        
        staggeredUpdates();
        
        return () => {
            isMounted = false;
        };
    }, []);

    const handleBackButtonPress = useCallback(() => {
        if (!selectionMode) {
            return false;
        }
        clearSelectedTransactions(undefined, true);
        return true;
    }, [selectionMode, clearSelectedTransactions]);

    useHandleBackButton(handleBackButtonPress);

    const memoizedValues = useMemo(() => {
        try {
            return {
                shouldDisplayCancelSearch: shouldUseNarrowLayout && ((!!queryJSON && !isCannedSearchQuery(queryJSON)) || componentState.searchRouterListVisible),
                headerStyles: StyleUtils?.getSearchPageNarrowHeaderStyles?.() || {},
                isDataLoaded: queryJSON ? isSearchDataLoaded(currentSearchResults, lastNonEmptySearchResults, queryJSON) : false,
            };
        } catch (error) {
            console.error('SearchPageNarrow memoizedValues error:', error);
            return {
                shouldDisplayCancelSearch: false,
                headerStyles: {},
                isDataLoaded: false,
            };
        }
    }, [shouldUseNarrowLayout, StyleUtils, queryJSON, componentState.searchRouterListVisible, currentSearchResults, lastNonEmptySearchResults]);

    const cancelSearchCallback = useCallback(() => {
        if (componentState.searchRouterListVisible) {
            setComponentState(prev => ({ ...prev, searchRouterListVisible: false }));
            return;
        }
        Navigation.goBack(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));
    }, [componentState.searchRouterListVisible]);

    const handleSearchAction = useCallback((value: SearchParams | string) => {
        if (typeof value === 'string') {
            searchInServer(value);
        } else {
            search(value);
        }
    }, []);

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));

    if (!queryJSON) {
        return (
            <ScreenWrapper
                testID={SearchPageNarrow.displayName}
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

    const shouldShowLoadingState = !isOffline && !memoizedValues.isDataLoaded;

    return (
        <ScreenWrapper
            testID={SearchPageNarrow.displayName}
            shouldEnableMaxHeight
            offlineIndicatorStyle={styles.mtAuto}
            bottomContent={<NavigationTabBar selectedTab={NAVIGATION_TABS.SEARCH} />}
            headerGapStyles={styles.searchHeaderGap}
            shouldShowOfflineIndicator={!!searchResults}
        >
            <View style={[styles.flex1, styles.overflowHidden]}>
                {!selectionMode ? (
                    <View style={[memoizedValues.headerStyles, componentState.searchRouterListVisible && styles.flex1, styles.mh100]}>
                        <View style={[styles.zIndex10, styles.appBG]}>
                            <TopBar
                                shouldShowLoadingBar={shouldShowLoadingState}
                                breadcrumbLabel={translate('common.reports')}
                                shouldDisplaySearch={false}
                                cancelSearch={memoizedValues.shouldDisplayCancelSearch ? cancelSearchCallback : undefined}
                            />
                        </View>
                        <View style={[styles.flex1]}>
                            <Animated.View style={[topBarAnimatedStyle, !componentState.searchRouterListVisible && styles.narrowSearchRouterInactiveStyle, styles.flex1, styles.bgTransparent]}>
                                <View style={[styles.flex1, styles.pt2, styles.appBG]}>
                                    <SearchPageHeader
                                        queryJSON={queryJSON}
                                        searchRouterListVisible={componentState.searchRouterListVisible}
                                        hideSearchRouterList={() => {
                                            setComponentState(prev => ({ ...prev, searchRouterListVisible: false }));
                                        }}
                                        onSearchRouterFocus={() => {
                                            if (componentState.isAnimationSystemReady) {
                                                topBarOffset.set(StyleUtils.searchHeaderDefaultOffset);
                                            }
                                            setComponentState(prev => ({ ...prev, searchRouterListVisible: true }));
                                        }}
                                        headerButtonsOptions={headerButtonsOptions || []}
                                        handleSearch={handleSearchAction}
                                    />
                                </View>
                                <View style={[styles.appBG]}>
                                    {!componentState.searchRouterListVisible && componentState.shouldRenderFiltersBar && (
                                        <SearchFiltersBar
                                            queryJSON={queryJSON}
                                            headerButtonsOptions={headerButtonsOptions || []}
                                        />
                                    )}
                                </View>
                            </Animated.View>
                        </View>
                    </View>
                ) : (
                    <>
                        <HeaderWithBackButton
                            title={translate('common.selectMultiple')}
                            onBackButtonPress={() => {
                                if (componentState.isAnimationSystemReady) {
                                    topBarOffset.set(StyleUtils.searchHeaderDefaultOffset);
                                }
                                clearSelectedTransactions();
                                turnOffMobileSelectionMode();
                            }}
                        />
                        <SearchPageHeader
                            queryJSON={queryJSON}
                            headerButtonsOptions={headerButtonsOptions || []}
                            handleSearch={handleSearchAction}
                        />
                    </>
                )}
                {!componentState.searchRouterListVisible && (
                    <View style={[styles.flex1]}>
                        {componentState.shouldRenderSearch ? (
                            <Search
                                currentSearchResults={currentSearchResults}
                                lastNonEmptySearchResults={lastNonEmptySearchResults}
                                key={queryJSON.hash}
                                queryJSON={queryJSON}
                                onSearchListScroll={scrollHandler}
                                contentContainerStyle={!selectionMode ? styles.searchListContentContainerStyles : undefined}
                                handleSearch={handleSearchAction}
                            />
                        ) : (
                            <SearchRowSkeleton
                                shouldAnimate
                                containerStyle={styles.searchListContentContainerStyles}
                            />
                        )}
                    </View>
                )}
            </View>
        </ScreenWrapper>
    );
});

SearchPageNarrow.displayName = 'SearchPageNarrow';

export default SearchPageNarrow;
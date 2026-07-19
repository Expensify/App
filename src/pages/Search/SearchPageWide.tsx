import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import {useSearchSidebarContentOffsetStyle} from '@components/Navigation/SearchSidebarCollapseStore';
import ReceiptScanDropZone from '@components/ReceiptScanDropZone';
import ScreenWrapper from '@components/ScreenWrapper';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import {useSearchQueryContext, useSearchResultsContext, useSearchSelectionContext} from '@components/Search/SearchContext';
import SearchLoadingSkeleton from '@components/Search/SearchLoadingSkeleton';
import SearchActionsBarWide from '@components/Search/SearchPageHeader/SearchActionsBarWide';
import SearchPageHeaderWide from '@components/Search/SearchPageHeader/SearchPageHeaderWide';
import SearchSelectionFooter from '@components/Search/SearchSelectionFooter';
import SearchWithNavigationDeferredMount from '@components/Search/SearchWithNavigationDeferredMount';
import type {SearchParams, SearchQueryJSON} from '@components/Search/types';

import useEndSubmitNavigationSpans from '@hooks/useEndSubmitNavigationSpans';
import useNetwork from '@hooks/useNetwork';
import useSearchLoadingState from '@hooks/useSearchLoadingState';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import {isSearchDataLoaded} from '@libs/SearchUIUtils';

import Navigation from '@navigation/Navigation';

import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {SearchResults} from '@src/types/onyx';

import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React, {useCallback, useContext, useMemo, useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated from 'react-native-reanimated';

type SearchPageWideProps = {
    queryJSON?: SearchQueryJSON;
    searchResults: OnyxEntry<SearchResults>;
    searchRequestResponseStatusCode: number | null;
    isMobileSelectionModeEnabled: boolean;
    handleSearchAction: (value: SearchParams | string) => void;
    onSortPressedCallback: () => void;
    route: PlatformStackRouteProp<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.ROOT>;
    /** Overlay rendered above Search content during expense-creation flows (SearchStaticList or null). */
    searchOverlayContent: React.ReactNode;
    /** Callback for Search to signal that real content is ready and the overlay can be dismissed. */
    onSearchContentReady: () => void;
};

function SearchPageWide({
    queryJSON,
    searchResults,
    searchRequestResponseStatusCode,
    isMobileSelectionModeEnabled,
    handleSearchAction,
    onSortPressedCallback,
    route,
    searchOverlayContent,
    onSearchContentReady,
}: SearchPageWideProps) {
    const shouldShowLoadingSkeleton = useSearchLoadingState(queryJSON, searchResults);
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {shouldUseLiveData} = useSearchResultsContext();
    const {currentSearchKey} = useSearchQueryContext();
    const {hasSelectedTransactions} = useSearchSelectionContext();

    // The offline-indicator offset must track the footer's real visibility. SearchSelectionFooter shows on a
    // selection even when server totals are absent (e.g. expense-report searches), so a totals-only check leaves
    // the indicator unreserved and it drops onto its own line. Reading `hasSelectedTransactions` re-renders only
    // this component on selection changes (its memoized JSX keeps the <Search> subtree from re-rendering;
    // verified via profiling), so the heavy list is unaffected.
    const shouldAllowFooterTotals = useSearchShouldCalculateTotals(currentSearchKey, queryJSON?.hash, true);
    const shouldReserveFooterSpace = hasSelectedTransactions || (shouldAllowFooterTotals && !!searchResults?.search?.count);
    const {saveScrollOffset} = useContext(ScrollOffsetContext);
    const receiptDropTargetRef = useRef<View>(null);

    const endSubmitNavigationSpans = useEndSubmitNavigationSpans({requireLayout: false});

    const scrollHandler = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            if (!e.nativeEvent.contentOffset.y) {
                return;
            }

            saveScrollOffset(route, e.nativeEvent.contentOffset.y);
        },
        [saveScrollOffset, route],
    );

    const offlineIndicatorStyle = useMemo(() => {
        if (shouldReserveFooterSpace) {
            return [styles.mtAuto, styles.pAbsolute, styles.h10, styles.b0];
        }

        return [styles.mtAuto];
    }, [shouldReserveFooterSpace, styles]);

    const handleOnBackButtonPress = () => Navigation.goBack(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery()}));
    const splitContainerAnimatedStyle = useSearchSidebarContentOffsetStyle();

    return (
        <Animated.View
            ref={receiptDropTargetRef}
            style={[styles.searchSplitContainer, splitContainerAnimatedStyle]}
        >
            <ScreenWrapper
                testID="Search"
                shouldEnableMaxHeight
                shouldShowOfflineIndicatorInWideScreen={!!searchResults}
                offlineIndicatorStyle={offlineIndicatorStyle}
            >
                <FullPageNotFoundView
                    shouldForceFullScreen
                    shouldShow={!queryJSON}
                    onBackButtonPress={handleOnBackButtonPress}
                    shouldShowLink={false}
                >
                    {!!queryJSON && (
                        <>
                            <SearchPageHeaderWide queryJSON={queryJSON} />
                            <SearchActionsBarWide
                                queryJSON={queryJSON}
                                searchResults={searchResults}
                                onSort={onSortPressedCallback}
                            />
                            <View style={styles.flex1}>
                                {shouldShowLoadingSkeleton ? (
                                    <SearchLoadingSkeleton
                                        reasonAttributes={{
                                            context: 'SearchPage',
                                            isOffline,
                                            isDataLoaded: shouldUseLiveData || isSearchDataLoaded(searchResults, queryJSON),
                                            isSearchLoading: !!searchResults?.search?.isLoading,
                                            hasEmptyData: Array.isArray(searchResults?.data) && searchResults?.data.length === 0,
                                            hasErrors: Object.keys(searchResults?.errors ?? {}).length > 0 && !isOffline,
                                            hasPendingResponse: searchRequestResponseStatusCode === null,
                                            shouldUseLiveData,
                                        }}
                                    />
                                ) : (
                                    <SearchWithNavigationDeferredMount
                                        key={queryJSON.hash}
                                        queryJSON={queryJSON}
                                        searchResults={searchResults}
                                        handleSearch={handleSearchAction}
                                        isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                                        onSearchListScroll={scrollHandler}
                                        onSortPressedCallback={onSortPressedCallback}
                                        searchRequestResponseStatusCode={searchRequestResponseStatusCode}
                                        onDestinationVisible={endSubmitNavigationSpans}
                                        onContentReady={onSearchContentReady}
                                    />
                                )}
                                {!!searchOverlayContent && <View style={[StyleSheet.absoluteFill, styles.appBG]}>{searchOverlayContent}</View>}
                            </View>
                            <SearchSelectionFooter searchResults={searchResults} />
                        </>
                    )}
                </FullPageNotFoundView>
            </ScreenWrapper>
            {!!queryJSON && <ReceiptScanDropZone targetRef={receiptDropTargetRef} />}
        </Animated.View>
    );
}

export default SearchPageWide;

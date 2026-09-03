import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import {useSearchSidebarContentOffsetStyle} from '@components/Navigation/SearchSidebarCollapseStore';
import ReceiptScanDropZone from '@components/ReceiptScanDropZone';
import ScreenWrapper from '@components/ScreenWrapper';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import SearchContentContextProvider from '@components/Search/SearchContentContextProvider';
import {useSearchQueryContext, useSearchSelectionContext} from '@components/Search/SearchContext';
import SearchLoadingSkeleton from '@components/Search/SearchLoadingSkeleton';
import SearchActionsBarWide from '@components/Search/SearchPageHeader/SearchActionsBarWide';
import SearchPageHeaderWide from '@components/Search/SearchPageHeader/SearchPageHeaderWide';
import SearchSelectionFooter from '@components/Search/SearchSelectionFooter';
import SearchWithNavigationDeferredMount from '@components/Search/SearchWithNavigationDeferredMount';
import type {SearchParams, SearchQueryJSON} from '@components/Search/types';

import useEndSubmitNavigationSpans from '@hooks/useEndSubmitNavigationSpans';
import usePrevious from '@hooks/usePrevious';
import useSearchLoadingState from '@hooks/useSearchLoadingState';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useSearchSkeletonVisibility from '@hooks/useSearchSkeletonVisibility';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {SearchResults} from '@src/types/onyx';

import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React, {useCallback, useContext, useMemo, useRef} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {FadeIn, LayoutAnimationConfig} from 'react-native-reanimated';

type SearchPageWideProps = {
    queryJSON?: SearchQueryJSON;
    searchResults: OnyxEntry<SearchResults>;

    /** The last query whose results resolved. The area renders these, holding them while a new query loads. */
    contentQueryJSON?: SearchQueryJSON;
    contentSearchResults: OnyxEntry<SearchResults>;

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
    contentQueryJSON,
    contentSearchResults,
    isMobileSelectionModeEnabled,
    handleSearchAction,
    onSortPressedCallback,
    route,
    searchOverlayContent,
    onSearchContentReady,
}: SearchPageWideProps) {
    const shouldShowLoadingSkeleton = useSearchLoadingState(contentQueryJSON, contentSearchResults);
    const shouldRenderLoadingSkeleton = useSearchSkeletonVisibility(shouldShowLoadingSkeleton);

    // A layer replacing results already on screen renders its hydrate placeholder invisibly, since a skeleton there
    // reads as a flash between two sets of results.
    const previousContentHash = usePrevious(contentQueryJSON?.hash);
    const isReplacingPreviousContent = previousContentHash !== contentQueryJSON?.hash;
    const styles = useThemeStyles();
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
                    {!!queryJSON && !!contentQueryJSON && (
                        <>
                            <SearchPageHeaderWide queryJSON={queryJSON} />
                            <SearchActionsBarWide
                                queryJSON={queryJSON}
                                searchResults={searchResults}
                                onSort={onSortPressedCallback}
                            />
                            {/* The rendered pair is re-provided to the search contexts so held rows keep the snapshot they belong to. */}
                            <SearchContentContextProvider
                                queryJSON={contentQueryJSON}
                                searchResults={contentSearchResults}
                            >
                                <View style={styles.flex1}>
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
                                            {shouldRenderLoadingSkeleton && <SearchLoadingSkeleton isLoading={shouldShowLoadingSkeleton} />}
                                            {!shouldShowLoadingSkeleton && (
                                                <SearchWithNavigationDeferredMount
                                                    isReplacingContent={isReplacingPreviousContent}
                                                    queryJSON={contentQueryJSON}
                                                    searchResults={contentSearchResults}
                                                    handleSearch={handleSearchAction}
                                                    isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                                                    onSearchListScroll={scrollHandler}
                                                    onSortPressedCallback={onSortPressedCallback}
                                                    onDestinationVisible={endSubmitNavigationSpans}
                                                    onContentReady={onSearchContentReady}
                                                />
                                            )}
                                        </Animated.View>
                                    </LayoutAnimationConfig>
                                    {!!searchOverlayContent && <View style={[StyleSheet.absoluteFill, styles.appBG]}>{searchOverlayContent}</View>}
                                </View>
                                <SearchSelectionFooter searchResults={contentSearchResults} />
                            </SearchContentContextProvider>
                        </>
                    )}
                </FullPageNotFoundView>
            </ScreenWrapper>
            {!!queryJSON && <ReceiptScanDropZone targetRef={receiptDropTargetRef} />}
        </Animated.View>
    );
}

export default SearchPageWide;

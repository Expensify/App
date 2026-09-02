import {ReportSubmitToPopoverHost, SEARCH_REPORT_SUBMIT_TO_POPOVER_ANCHOR_ALIGNMENT} from '@components/ReportSubmitToPopoverAnchor';
import {useSearchQueryContext, useSearchResultsActions, useSearchResultsContext, useSearchSelectionActions} from '@components/Search/SearchContext';
import type {SearchParams, SearchQueryJSON} from '@components/Search/types';
import {usePlaybackActionsContext} from '@components/VideoPlayerContexts/PlaybackContext';

import useDocumentTitle from '@hooks/useDocumentTitle';
import useEndSubmitNavigationSpans from '@hooks/useEndSubmitNavigationSpans';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useOnyx from '@hooks/useOnyx';
import {PaymentContextProvider} from '@hooks/usePaymentContext';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchOverlay from '@hooks/useSearchOverlay';
import useSearchPageSetup from '@hooks/useSearchPageSetup';
import useSeedMyExpensesSearch from '@hooks/useSeedMyExpensesSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {searchInServer} from '@libs/actions/Report';
import {clearFooterConversion, search} from '@libs/actions/Search';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {isQueryARefinement} from '@libs/SearchQueryRefinement';
import {isSearchDataLoaded} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {hasFilterBarsSelector} from '@src/selectors/AdvancedSearchFiltersForm';
import type {SearchResults} from '@src/types/onyx';

import React, {useCallback, useEffect, useState} from 'react';
import Animated from 'react-native-reanimated';

import SearchPageNarrow from './SearchPageNarrow';
import SearchPageWide from './SearchPageWide';

type SearchPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.ROOT>;

function SearchPage({route}: SearchPageProps) {
    const {translate} = useLocalize();
    useDocumentTitle(translate('common.spend'));
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {lastSearchType, currentSearchResults, shouldUseLiveData} = useSearchResultsContext();
    const {currentSearchKey, currentSearchQueryJSON} = useSearchQueryContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {setLastSearchType} = useSearchResultsActions();

    const isMobileSelectionModeEnabled = useMobileSelectionMode(clearSelectedTransactions);
    const [hasFilterBars = false] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: hasFilterBarsSelector});

    const [lastNonEmptySearchResults, setLastNonEmptySearchResults] = useState<SearchResults | undefined>(undefined);

    useSearchPageSetup(currentSearchQueryJSON);
    useSeedMyExpensesSearch();

    // Adjust state during rendering rather than in a useEffect: the value is consumed in the same
    // render below (`searchResults = lastNonEmptySearchResults` when sorting), so a useEffect would
    // commit one stale render before catching up. The reference equality check
    // (`currentSearchResults !== lastNonEmptySearchResults`) bounds the re-render loop to a single
    // extra pass — see https://react.dev/reference/react/useState#storing-information-from-previous-renders.
    if (currentSearchResults?.data && !shouldUseLiveData && currentSearchResults !== lastNonEmptySearchResults) {
        setLastNonEmptySearchResults(currentSearchResults);
    }

    useEffect(() => {
        if (!currentSearchResults?.search?.type) {
            return;
        }

        setLastSearchType(currentSearchResults.search.type);
    }, [lastSearchType, currentSearchQueryJSON, setLastSearchType, currentSearchResults?.search?.type]);

    const {resetVideoPlayerData} = usePlaybackActionsContext();

    const [isSorting, setIsSorting] = useState(false);

    // Sorting keeps the previous results on screen while the re-sorted ones load. Changing the search cancels that,
    // and opening one no longer remounts this page, so a flag left set would render the previous query's rows under
    // the new query. Adjusted during rendering because searchResults below consumes it in this same render.
    const previousQueryHash = usePrevious(currentSearchQueryJSON?.hash);
    if (isSorting && previousQueryHash !== currentSearchQueryJSON?.hash) {
        setIsSorting(false);
    }

    const isCurrentSearchResolved = isSearchDataLoaded(currentSearchResults, currentSearchQueryJSON);
    let searchResults: SearchResults | undefined;
    if (isCurrentSearchResolved && currentSearchResults?.search && currentSearchResults.data === undefined) {
        searchResults = {...currentSearchResults, data: {}};
    } else if (currentSearchResults?.data != null || currentSearchResults?.errors) {
        searchResults = currentSearchResults;
    } else if (isSorting) {
        searchResults = lastNonEmptySearchResults;
    }

    useEffect(() => {
        if (shouldUseNarrowLayout) {
            return;
        }
        resetVideoPlayerData();
        return () => {
            if (shouldUseNarrowLayout) {
                return;
            }
            resetVideoPlayerData();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Converted footer totals are ephemeral, session-scoped display data, so drop them when leaving Search.
    useEffect(() => () => clearFooterConversion(), []);

    const prevIsLoading = usePrevious(currentSearchResults?.isLoading);

    useEffect(() => {
        if (!isSorting || !prevIsLoading || currentSearchResults?.isLoading) {
            return;
        }

        setIsSorting(false);
    }, [currentSearchResults?.isLoading, isSorting, prevIsLoading]);

    const [lastResolvedSearch, setLastResolvedSearch] = useState<{queryJSON: SearchQueryJSON; searchResults: SearchResults} | undefined>(undefined);

    // Changing a filter builds a query that has never been cached, so keying the results area on the requested
    // query would mount it with no data and flash a skeleton in the middle of the fade. Key it on the last query
    // that actually resolved instead: the current results stay on screen until the new ones arrive, then the area
    // swaps once. Adjusted during rendering for the same reason as lastNonEmptySearchResults above — the values
    // below are consumed in this render, and the reference check bounds the loop to one extra pass.
    // isCurrentSearchResolved, not a raw hash comparison: a response folds sort defaults into its own hash, so the
    // requested and returned hashes legitimately differ and isSearchDataLoaded is what reconciles them.
    const isSearchResolvedForCurrentQuery = isCurrentSearchResolved && !!searchResults && !!currentSearchQueryJSON;
    if (isSearchResolvedForCurrentQuery && currentSearchQueryJSON && searchResults && lastResolvedSearch?.searchResults !== searchResults) {
        setLastResolvedSearch({queryJSON: currentSearchQueryJSON, searchResults});
    }

    // A slow query would otherwise leave the previous results up indefinitely with nothing to show a wait is happening
    // (the wide layout has no loading bar). Keyed by hash rather than reset on resolve so the effect never has to call
    // setState synchronously; a hash that no longer matches simply stops counting.
    const [staleHoldTimedOutHash, setStaleHoldTimedOutHash] = useState<number | undefined>(undefined);
    const currentQueryHash = currentSearchQueryJSON?.hash;

    useEffect(() => {
        if (isSearchResolvedForCurrentQuery || currentQueryHash === undefined) {
            return;
        }

        const timeoutID = setTimeout(() => setStaleHoldTimedOutHash(currentQueryHash), CONST.SEARCH.ANIMATION.MAX_STALE_HOLD_DURATION);
        return () => clearTimeout(timeoutID);
    }, [isSearchResolvedForCurrentQuery, currentQueryHash]);

    const hasStaleHoldTimedOut = staleHoldTimedOutHash !== undefined && staleHoldTimedOutHash === currentQueryHash;

    // Only a filter refinement is worth holding for. A sidebar item or saved search is a different search, so its
    // results area starts from the skeleton rather than showing rows that belong to the query the user just left.
    const shouldHoldLastResolvedSearch = !isSearchResolvedForCurrentQuery && !!lastResolvedSearch && !hasStaleHoldTimedOut && isQueryARefinement(currentSearchQueryJSON?.inputQuery);
    const contentQueryJSON = shouldHoldLastResolvedSearch ? lastResolvedSearch.queryJSON : currentSearchQueryJSON;
    const contentSearchResults = shouldHoldLastResolvedSearch ? lastResolvedSearch.searchResults : searchResults;

    const handleSearchAction = useCallback((value: SearchParams | string) => {
        if (typeof value === 'string') {
            searchInServer(value);
        } else {
            search(value);
        }
    }, []);

    const onSortPressedCallback = useCallback(() => {
        setIsSorting(true);
    }, []);

    const overlayContentContainerStyle = !isMobileSelectionModeEnabled ? styles.searchListContentContainerStyles(!!hasFilterBars) : undefined;
    const overlayEndSubmitSpans = useEndSubmitNavigationSpans();
    const {searchOverlayContent, onSearchContentReady, isOverlayActive} = useSearchOverlay({
        searchResults,
        queryJSON: currentSearchQueryJSON,
        shouldUseNarrowLayout,
        isMobileSelectionModeEnabled,
        currentSearchKey,
        contentContainerStyle: overlayContentContainerStyle,
        onDestinationVisible: overlayEndSubmitSpans,
    });

    return (
        <ReportSubmitToPopoverHost anchorAlignment={SEARCH_REPORT_SUBMIT_TO_POPOVER_ANCHOR_ALIGNMENT}>
            <PaymentContextProvider>
                <Animated.View style={[styles.flex1]}>
                    {shouldUseNarrowLayout ? (
                        <SearchPageNarrow
                            queryJSON={currentSearchQueryJSON}
                            searchResults={searchResults}
                            contentQueryJSON={contentQueryJSON}
                            contentSearchResults={contentSearchResults}
                            isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                            onSortPressedCallback={onSortPressedCallback}
                            searchOverlayContent={searchOverlayContent}
                            onSearchContentReady={onSearchContentReady}
                            hasFilterBars={hasFilterBars}
                            isOverlayActive={isOverlayActive}
                        />
                    ) : (
                        <SearchPageWide
                            queryJSON={currentSearchQueryJSON}
                            searchResults={searchResults}
                            contentQueryJSON={contentQueryJSON}
                            contentSearchResults={contentSearchResults}
                            isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                            handleSearchAction={handleSearchAction}
                            onSortPressedCallback={onSortPressedCallback}
                            route={route}
                            searchOverlayContent={searchOverlayContent}
                            onSearchContentReady={onSearchContentReady}
                        />
                    )}
                </Animated.View>
            </PaymentContextProvider>
        </ReportSubmitToPopoverHost>
    );
}
SearchPage.whyDidYouRender = true;

export default SearchPage;

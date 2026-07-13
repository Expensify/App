import {ReportSubmitToPopoverHost, SEARCH_REPORT_SUBMIT_TO_POPOVER_ANCHOR_ALIGNMENT} from '@components/ReportSubmitToPopoverAnchor';
import {useSearchQueryContext, useSearchResultsActions, useSearchResultsContext, useSearchSelectionActions} from '@components/Search/SearchContext';
import type {SearchParams} from '@components/Search/types';
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
import useThemeStyles from '@hooks/useThemeStyles';

import {searchInServer} from '@libs/actions/Report';
import {search} from '@libs/actions/Search';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';

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

    let searchResults: SearchResults | undefined;
    if (currentSearchResults?.data != null || currentSearchResults?.errors) {
        searchResults = currentSearchResults;
    } else if (isSorting) {
        searchResults = lastNonEmptySearchResults;
    }

    const metadata = searchResults?.search;

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

    const prevIsLoading = usePrevious(currentSearchResults?.isLoading);

    useEffect(() => {
        if (!isSorting || !prevIsLoading || currentSearchResults?.isLoading) {
            return;
        }

        setIsSorting(false);
    }, [currentSearchResults?.isLoading, isSorting, prevIsLoading]);

    const [searchRequestResponseStatusCode, setSearchRequestResponseStatusCode] = useState<number | null>(null);

    const handleSearchAction = useCallback((value: SearchParams | string) => {
        if (typeof value === 'string') {
            searchInServer(value);
        } else {
            setSearchRequestResponseStatusCode(null);
            search(value)?.then((jsonCode) => {
                setSearchRequestResponseStatusCode(Number(jsonCode ?? 0));
            });
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
                            metadata={metadata}
                            searchResults={searchResults}
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
                            searchRequestResponseStatusCode={searchRequestResponseStatusCode}
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

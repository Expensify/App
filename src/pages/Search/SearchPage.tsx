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
import useReleaseOptionListCaches from '@hooks/useReleaseOptionListCaches';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchOverlay from '@hooks/useSearchOverlay';
import useSearchPageSetup from '@hooks/useSearchPageSetup';
import useSeedMyExpensesSearch from '@hooks/useSeedMyExpensesSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import {searchInServer} from '@libs/actions/Report';
import {clearFooterConversion, search} from '@libs/actions/Search';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';

import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {hasFilterBarsSelector} from '@src/selectors/AdvancedSearchFiltersForm';

import React, {useCallback, useEffect} from 'react';
import Animated from 'react-native-reanimated';

import SearchPageNarrow from './SearchPageNarrow';
import SearchPageWide from './SearchPageWide';

type SearchPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.ROOT>;

function SearchPage({route}: SearchPageProps) {
    const {translate} = useLocalize();
    useDocumentTitle(translate('common.spend'));
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    // `displayedSearchResults` is derived in SearchResultsProvider so this screen and the Edit columns picker
    // read the exact same snapshot — see its comment there.
    const {lastSearchType, currentSearchResults, displayedSearchResults: searchResults} = useSearchResultsContext();
    const {currentSearchKey, currentSearchQueryJSON} = useSearchQueryContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {setLastSearchType, setIsSorting} = useSearchResultsActions();

    const isMobileSelectionModeEnabled = useMobileSelectionMode(clearSelectedTransactions);
    const [hasFilterBars = false] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: hasFilterBarsSelector});

    useSearchPageSetup(currentSearchQueryJSON);
    useSeedMyExpensesSearch();
    useReleaseOptionListCaches();

    useEffect(() => {
        if (!currentSearchResults?.search?.type) {
            return;
        }

        setLastSearchType(currentSearchResults.search.type);
    }, [lastSearchType, currentSearchQueryJSON, setLastSearchType, currentSearchResults?.search?.type]);

    const {resetVideoPlayerData} = usePlaybackActionsContext();

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

    const handleSearchAction = useCallback((value: SearchParams | string) => {
        if (typeof value === 'string') {
            searchInServer(value);
        } else {
            search(value);
        }
    }, []);

    const onSortPressedCallback = useCallback(() => {
        setIsSorting(true);
    }, [setIsSorting]);

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

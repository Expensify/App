import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Animated from 'react-native-reanimated';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import type {SearchParams} from '@components/Search/types';
import {usePlaybackActionsContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useConfirmReadyToOpenApp from '@hooks/useConfirmReadyToOpenApp';
import useDocumentTitle from '@hooks/useDocumentTitle';
import useEndSubmitNavigationSpans from '@hooks/useEndSubmitNavigationSpans';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchOverlay from '@hooks/useSearchOverlay';
import useSearchPageSetup from '@hooks/useSearchPageSetup';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchInServer} from '@libs/actions/Report';
import {search} from '@libs/actions/Search';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {hasFilterBarsSelector} from '@src/selectors/AdvancedSearchFiltersForm';
import type {SearchResults} from '@src/types/onyx';
import SearchPageNarrow from './SearchPageNarrow';
import SearchPageWide from './SearchPageWide';

type SearchPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.ROOT>;

function SearchPage({route}: SearchPageProps) {
    const {translate} = useLocalize();
    useDocumentTitle(translate('common.spend'));
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {selectedTransactions, lastSearchType, areAllMatchingItemsSelected, currentSearchHash, currentSearchKey, currentSearchResults, currentSearchQueryJSON, shouldUseLiveData} =
        useSearchStateContext();
    const {clearSelectedTransactions, setLastSearchType} = useSearchActionsContext();

    const isMobileSelectionModeEnabled = useMobileSelectionMode(clearSelectedTransactions);
    const [hasFilterBars = false] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: hasFilterBarsSelector});

    const [lastNonEmptySearchResults, setLastNonEmptySearchResults] = useState<SearchResults | undefined>(undefined);
    type FooterCurrencyState = {
        searchHash: typeof currentSearchHash | undefined;
        selectedCurrency: string | undefined;
        defaultCurrency: string | undefined;
        pendingCurrency: string | undefined;
    };
    const [footerCurrencyState, setFooterCurrencyState] = useState<FooterCurrencyState>({
        searchHash: undefined,
        selectedCurrency: undefined,
        defaultCurrency: undefined,
        pendingCurrency: undefined,
    });
    const isCurrentFooterState = footerCurrencyState.searchHash === currentSearchHash;
    const selectedCurrency = isCurrentFooterState ? footerCurrencyState.selectedCurrency : undefined;
    const defaultFooterCurrency = isCurrentFooterState ? footerCurrencyState.defaultCurrency : undefined;
    const pendingFooterCurrency = isCurrentFooterState ? footerCurrencyState.pendingCurrency : undefined;

    useConfirmReadyToOpenApp();
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

    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});

    const {resetVideoPlayerData} = usePlaybackActionsContext();

    const [isSorting, setIsSorting] = useState(false);

    let searchResults: SearchResults | undefined;
    if (currentSearchResults?.data != null || currentSearchResults?.errors) {
        searchResults = currentSearchResults;
    } else if (isSorting) {
        searchResults = lastNonEmptySearchResults;
    }

    const metadata = searchResults?.search;
    const shouldAllowFooterTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true);
    const shouldShowFooter = (!areAllMatchingItemsSelected && selectedTransactionsKeys.length > 0) || (shouldAllowFooterTotals && !!metadata?.count);

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

    const hasPendingFooterCurrencySettled = !!pendingFooterCurrency && metadata?.currency === pendingFooterCurrency && metadata?.count != null && metadata?.total != null;

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

    const handleFooterCurrencyChange = useCallback(
        (currency: string | undefined) => {
            const fallbackDefaultCurrency = defaultFooterCurrency ?? metadata?.currency;
            const nextCurrency = currency ?? fallbackDefaultCurrency;
            if (!currentSearchQueryJSON || !nextCurrency) {
                return;
            }

            setFooterCurrencyState({
                searchHash: currentSearchHash,
                selectedCurrency: currency,
                defaultCurrency: fallbackDefaultCurrency,
                pendingCurrency: nextCurrency,
            });
            handleSearchAction({
                queryJSON: currentSearchQueryJSON,
                searchKey: currentSearchKey,
                offset: 0,
                shouldCalculateTotals: true,
                isLoading: false,
                targetCurrency: nextCurrency,
            });
        },
        [currentSearchHash, currentSearchKey, currentSearchQueryJSON, defaultFooterCurrency, handleSearchAction, metadata?.currency],
    );

    const footerData = useMemo(() => {
        if (!shouldAllowFooterTotals && selectedTransactionsKeys.length === 0) {
            return {count: undefined, total: undefined, currency: undefined};
        }

        const shouldUseClientTotal = selectedTransactionsKeys.length > 0 || !metadata?.count;
        const selectedTransactionItems = Object.values(selectedTransactions);
        const isSelectedSubtotalLoading =
            shouldUseClientTotal && !!selectedCurrency && selectedTransactionItems.some((transaction) => !!transaction.groupCurrency && transaction.groupCurrency !== selectedCurrency);
        const currency = selectedCurrency ?? metadata?.currency ?? selectedTransactionItems.at(0)?.groupCurrency ?? selectedTransactionItems.at(0)?.currency;
        const numberOfExpense = shouldUseClientTotal
            ? selectedTransactionsKeys.reduce((count, key) => {
                  const item = selectedTransactions[key];
                  if (item.action === CONST.SEARCH.ACTION_TYPES.VIEW && key === item.reportID) {
                      return count;
                  }
                  return count + 1;
              }, 0)
            : metadata?.count;
        const total = shouldUseClientTotal
            ? selectedTransactionItems.reduce((acc, transaction) => {
                  const shouldUseGroupAmount = !selectedCurrency || transaction.groupCurrency === selectedCurrency;
                  return acc - (shouldUseGroupAmount ? (transaction.groupAmount ?? -Math.abs(transaction.amount)) : -Math.abs(transaction.amount));
              }, 0)
            : metadata?.total;
        return {count: numberOfExpense, total, currency, isLoading: isSelectedSubtotalLoading};
    }, [metadata?.count, metadata?.currency, metadata?.total, selectedCurrency, selectedTransactions, selectedTransactionsKeys, shouldAllowFooterTotals]);

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

    const isFooterTotalLoading = !!footerData.isLoading || (!!pendingFooterCurrency && !hasPendingFooterCurrencySettled);

    return (
        <Animated.View style={[styles.flex1]}>
            {shouldUseNarrowLayout ? (
                <SearchPageNarrow
                    queryJSON={currentSearchQueryJSON}
                    metadata={metadata}
                    searchResults={searchResults}
                    isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                    footerData={footerData}
                    footerDefaultCurrency={defaultFooterCurrency ?? metadata?.currency}
                    isFooterTotalLoading={isFooterTotalLoading}
                    targetCurrency={selectedCurrency}
                    onFooterCurrencyChange={handleFooterCurrencyChange}
                    shouldShowFooter={shouldShowFooter}
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
                    footerData={footerData}
                    footerDefaultCurrency={defaultFooterCurrency ?? metadata?.currency}
                    isFooterTotalLoading={isFooterTotalLoading}
                    targetCurrency={selectedCurrency}
                    onFooterCurrencyChange={handleFooterCurrencyChange}
                    handleSearchAction={handleSearchAction}
                    onSortPressedCallback={onSortPressedCallback}
                    route={route}
                    shouldShowFooter={shouldShowFooter}
                    searchOverlayContent={searchOverlayContent}
                    onSearchContentReady={onSearchContentReady}
                />
            )}
        </Animated.View>
    );
}

SearchPage.whyDidYouRender = true;

export default SearchPage;

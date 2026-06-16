import React, {useCallback, useEffect, useMemo, useState} from 'react';
import Animated from 'react-native-reanimated';
import {useSearchQueryContext, useSearchResultsActions, useSearchResultsContext, useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import type {SearchParams} from '@components/Search/types';
import {usePlaybackActionsContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useConfirmReadyToOpenApp from '@hooks/useConfirmReadyToOpenApp';
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
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchInServer} from '@libs/actions/Report';
import {search} from '@libs/actions/Search';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {buildFlatQueryWithoutGroupBy} from '@libs/SearchQueryUtils';
import {getValidGroupBy} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {hasFilterBarsSelector} from '@src/selectors/AdvancedSearchFiltersForm';
import type {SearchResults} from '@src/types/onyx';
import SearchPageNarrow from './SearchPageNarrow';
import SearchPageWide from './SearchPageWide';

type SearchPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.ROOT>;

type FooterCurrencyState = {
    searchHash: number | undefined;
    selectedCurrency: string | undefined;
    defaultCurrency: string | undefined;
    /** Hash of the auxiliary flat-query snapshot used for converted footer totals in grouped views */
    footerTotalHash: number | undefined;
};

function getNumberMember(value: unknown, memberName: string): number | undefined {
    if (!value || typeof value !== 'object') {
        return undefined;
    }

    const memberValue = (value as Record<string, unknown>)[memberName];
    return typeof memberValue === 'number' ? memberValue : undefined;
}

function SearchPage({route}: SearchPageProps) {
    const {translate} = useLocalize();
    useDocumentTitle(translate('common.spend'));
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {selectedTransactions, areAllMatchingItemsSelected} = useSearchSelectionContext();
    const {lastSearchType, currentSearchResults, shouldUseLiveData} = useSearchResultsContext();
    const {currentSearchHash, currentSearchKey, currentSearchQueryJSON} = useSearchQueryContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {setLastSearchType} = useSearchResultsActions();

    const isMobileSelectionModeEnabled = useMobileSelectionMode(clearSelectedTransactions);
    const [hasFilterBars = false] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: hasFilterBarsSelector});

    const [lastNonEmptySearchResults, setLastNonEmptySearchResults] = useState<SearchResults | undefined>(undefined);
    const [footerCurrencyState, setFooterCurrencyState] = useState<FooterCurrencyState>({
        searchHash: undefined,
        selectedCurrency: undefined,
        defaultCurrency: undefined,
        footerTotalHash: undefined,
    });
    const isCurrentFooterState = footerCurrencyState.searchHash === currentSearchHash;
    const selectedCurrency = isCurrentFooterState ? footerCurrencyState.selectedCurrency : undefined;
    const defaultFooterCurrency = isCurrentFooterState ? footerCurrencyState.defaultCurrency : undefined;

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
    const metadataCount = metadata?.count;
    const metadataCurrency = metadata?.currency;
    const metadataTotal = metadata?.total;
    const searchData = searchResults?.data;
    const validGroupBy = getValidGroupBy(currentSearchQueryJSON?.groupBy);
    const [footerTotalSnapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${footerCurrencyState.footerTotalHash}`);
    const footerTotalMetadata = isCurrentFooterState && footerCurrencyState.footerTotalHash !== undefined ? footerTotalSnapshot?.search : undefined;
    const footerTotalData = footerTotalSnapshot?.data;
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

            const isResettingToDefault = nextCurrency === fallbackDefaultCurrency;
            // Fetch converted footer totals in a currency-scoped snapshot for both grouped and ungrouped searches so
            // the live search snapshot stays in its original currency.
            const flatQueryJSON = !isResettingToDefault ? buildFlatQueryWithoutGroupBy(currentSearchQueryJSON, nextCurrency) : undefined;

            setFooterCurrencyState({
                searchHash: currentSearchHash,
                selectedCurrency: currency,
                defaultCurrency: fallbackDefaultCurrency,
                footerTotalHash: flatQueryJSON?.hash,
            });

            // Resetting to the default currency reads the existing native live snapshot, so no extra request is needed.
            if (!flatQueryJSON) {
                return;
            }

            handleSearchAction({
                queryJSON: flatQueryJSON,
                searchKey: undefined,
                offset: 0,
                shouldCalculateTotals: true,
                isLoading: false,
                targetCurrency: nextCurrency,
            });
        },
        [currentSearchHash, currentSearchQueryJSON, defaultFooterCurrency, handleSearchAction, metadata?.currency],
    );

    const footerData = useMemo(() => {
        if (!shouldAllowFooterTotals && selectedTransactionsKeys.length === 0) {
            return {count: undefined, total: undefined, currency: undefined};
        }

        const selectedTransactionItems = Object.values(selectedTransactions);
        const selectedExpenseCount = selectedTransactionsKeys.reduce((count, key) => {
            if (key.startsWith(CONST.SEARCH.GROUP_PREFIX)) {
                const group: unknown = searchData ? (searchData as Record<string, unknown>)[key] : undefined;
                return count + (getNumberMember(group, 'count') ?? 0);
            }
            const item = selectedTransactions[key];
            if (item.action === CONST.SEARCH.ACTION_TYPES.VIEW && key === item.reportID) {
                return count;
            }
            return count + 1;
        }, 0);
        const areAllSelectedForFooter = areAllMatchingItemsSelected || (selectedTransactionsKeys.length > 0 && metadataCount !== undefined && selectedExpenseCount === metadataCount);
        const shouldUseClientTotal = !metadataCount || (selectedTransactionsKeys.length > 0 && !areAllSelectedForFooter);
        const defaultCurrency = defaultFooterCurrency ?? metadataCurrency;
        const hasCustomFooterCurrency = !!selectedCurrency && selectedCurrency !== defaultCurrency;
        const isServerTotalConfirmed = !hasCustomFooterCurrency || footerTotalMetadata?.currency === selectedCurrency;
        const canConvertSelectedTotal = shouldUseClientTotal && hasCustomFooterCurrency && footerTotalMetadata?.currency === selectedCurrency;
        // The footer conversion snapshot only covers the first flat page, so a selected row from a later page (or a
        // selected group header) may have no converted amount. Only label the selected total as the target currency
        // when every selected row is convertible; otherwise the sum would mix converted and native amounts, so fall
        // back to the default-currency client total instead.
        const areAllSelectedRowsConverted =
            canConvertSelectedTotal &&
            !!footerTotalData &&
            selectedTransactionsKeys.every((key) => {
                const transaction = selectedTransactions[key];
                const convertedTransactionKey = transaction?.transaction?.transactionID ? `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transaction.transactionID}` : key;
                const convertedTransaction: unknown = (footerTotalData as Record<string, unknown>)[convertedTransactionKey];
                return getNumberMember(convertedTransaction, 'groupAmount') !== undefined;
            });
        const shouldUseConvertedSelectedTotal = canConvertSelectedTotal && areAllSelectedRowsConverted;
        // Custom-currency totals (grand and partial selections) need a backend conversion round-trip, so show loading
        // whenever that conversion snapshot is in flight.
        const isFooterTotalConverting = hasCustomFooterCurrency && !!footerTotalMetadata?.isLoading;
        let currency;
        if (shouldUseConvertedSelectedTotal) {
            currency = selectedCurrency;
        } else if (shouldUseClientTotal) {
            currency = defaultCurrency ?? selectedTransactionItems.at(0)?.groupCurrency ?? selectedTransactionItems.at(0)?.currency;
        } else if (isServerTotalConfirmed) {
            currency = selectedCurrency ?? footerTotalMetadata?.currency ?? defaultCurrency ?? metadataCurrency;
        } else {
            currency = metadataCurrency ?? defaultCurrency;
        }
        const numberOfExpense = shouldUseClientTotal ? selectedExpenseCount : metadataCount;
        let total;
        if (shouldUseClientTotal) {
            total = selectedTransactionsKeys.reduce((acc, key) => {
                const transaction = selectedTransactions[key];
                const convertedTransactionKey = transaction.transaction?.transactionID ? `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transaction.transactionID}` : key;
                const convertedTransaction: unknown = shouldUseConvertedSelectedTotal && footerTotalData ? (footerTotalData as Record<string, unknown>)[convertedTransactionKey] : undefined;
                return acc - (getNumberMember(convertedTransaction, 'groupAmount') ?? transaction.groupAmount ?? -Math.abs(transaction.amount));
            }, 0);
        } else if (hasCustomFooterCurrency) {
            total = isServerTotalConfirmed ? footerTotalMetadata?.total : metadataTotal;
        } else {
            total = metadataTotal;
        }

        return {count: numberOfExpense, total, currency, isLoading: isFooterTotalConverting};
    }, [
        areAllMatchingItemsSelected,
        defaultFooterCurrency,
        footerTotalData,
        footerTotalMetadata?.currency,
        footerTotalMetadata?.isLoading,
        footerTotalMetadata?.total,
        metadataCount,
        metadataCurrency,
        metadataTotal,
        selectedCurrency,
        selectedTransactions,
        selectedTransactionsKeys,
        searchData,
        shouldAllowFooterTotals,
    ]);

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

    const isFooterTotalLoading = !!footerData.isLoading || (!validGroupBy && !!metadata?.isLoading);

    return (
        <PaymentContextProvider>
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
        </PaymentContextProvider>
    );
}

SearchPage.whyDidYouRender = true;

export default SearchPage;

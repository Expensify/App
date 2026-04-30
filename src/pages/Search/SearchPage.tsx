import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Animated from 'react-native-reanimated';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import type {SearchParams} from '@components/Search/types';
import {usePlaybackActionsContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useConfirmReadyToOpenApp from '@hooks/useConfirmReadyToOpenApp';
import useDocumentTitle from '@hooks/useDocumentTitle';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchPageSetup from '@hooks/useSearchPageSetup';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchInServer} from '@libs/actions/Report';
import {search} from '@libs/actions/Search';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {SearchResults} from '@src/types/onyx';
import SearchPageNarrow from './SearchPageNarrow';
import SearchPageWide from './SearchPageWide';

type SearchPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.ROOT>;

function SearchPage({route}: SearchPageProps) {
    const {translate} = useLocalize();
    useDocumentTitle(translate('common.spend'));
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {selectedTransactions, lastSearchType, areAllMatchingItemsSelected, currentSearchKey, currentSearchResults, currentSearchQueryJSON} = useSearchStateContext();
    const {clearSelectedTransactions, setLastSearchType} = useSearchActionsContext();

    const isMobileSelectionModeEnabled = useMobileSelectionMode(clearSelectedTransactions);

    const lastNonEmptySearchResults = useRef<SearchResults | undefined>(undefined);

    useConfirmReadyToOpenApp();
    useSearchPageSetup(currentSearchQueryJSON);

    useEffect(() => {
        if (!currentSearchResults?.search?.type) {
            return;
        }

        setLastSearchType(currentSearchResults.search.type);
        if (currentSearchResults.data) {
            lastNonEmptySearchResults.current = currentSearchResults;
        }
    }, [lastSearchType, currentSearchQueryJSON, setLastSearchType, currentSearchResults]);

    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});

    const {resetVideoPlayerData} = usePlaybackActionsContext();

    const [isSorting, setIsSorting] = useState(false);

    let searchResults: SearchResults | undefined;
    if (currentSearchResults?.data != null || currentSearchResults?.errors) {
        searchResults = currentSearchResults;
    } else if (isSorting) {
        searchResults = lastNonEmptySearchResults.current;
    }

    const metadata = searchResults?.search;
    const shouldAllowFooterTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true);
    const shouldShowFooter = selectedTransactionsKeys.length > 0 || (shouldAllowFooterTotals && !!metadata?.count);

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

    const footerData = useMemo(() => {
        if (!shouldAllowFooterTotals && selectedTransactionsKeys.length === 0) {
            return {count: undefined, total: undefined, currency: undefined};
        }

        const shouldUseClientTotal = selectedTransactionsKeys.length > 0 || !metadata?.count || (selectedTransactionsKeys.length > 0 && !areAllMatchingItemsSelected);
        const selectedTransactionItems = Object.values(selectedTransactions);
        const currency = metadata?.currency ?? selectedTransactionItems.at(0)?.groupCurrency ?? selectedTransactionItems.at(0)?.currency;
        const numberOfExpense = shouldUseClientTotal
            ? selectedTransactionsKeys.reduce((count, key) => {
                  const item = selectedTransactions[key];
                  if (item.action === CONST.SEARCH.ACTION_TYPES.VIEW && key === item.reportID) {
                      return count;
                  }
                  return count + 1;
              }, 0)
            : metadata?.count;
        const total = shouldUseClientTotal ? selectedTransactionItems.reduce((acc, transaction) => acc - (transaction.groupAmount ?? -Math.abs(transaction.amount)), 0) : metadata?.total;

        return {count: numberOfExpense, total, currency};
    }, [areAllMatchingItemsSelected, metadata?.count, metadata?.currency, metadata?.total, selectedTransactions, selectedTransactionsKeys, shouldAllowFooterTotals]);

    const onSortPressedCallback = useCallback(() => {
        setIsSorting(true);
    }, []);

    return (
        <Animated.View style={[styles.flex1]}>
            {shouldUseNarrowLayout ? (
                <SearchPageNarrow
                    queryJSON={currentSearchQueryJSON}
                    metadata={metadata}
                    searchResults={searchResults}
                    isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                    footerData={footerData}
                    shouldShowFooter={shouldShowFooter}
                    onSortPressedCallback={onSortPressedCallback}
                />
            ) : (
                <SearchPageWide
                    queryJSON={currentSearchQueryJSON}
                    searchResults={searchResults}
                    searchRequestResponseStatusCode={searchRequestResponseStatusCode}
                    isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                    footerData={footerData}
                    handleSearchAction={handleSearchAction}
                    onSortPressedCallback={onSortPressedCallback}
                    route={route}
                    shouldShowFooter={shouldShowFooter}
                />
            )}
        </Animated.View>
    );
}

SearchPage.whyDidYouRender = true;

export default SearchPage;

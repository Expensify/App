import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import Animated from 'react-native-reanimated';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DragAndDropProvider from '@components/DragAndDrop/Provider';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import type {SearchParams} from '@components/Search/types';
import {usePlaybackActionsContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useConfirmReadyToOpenApp from '@hooks/useConfirmReadyToOpenApp';
import useFilterFormValues from '@hooks/useFilterFormValues';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import usePrevious from '@hooks/usePrevious';
import useReceiptScanDrop from '@hooks/useReceiptScanDrop';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {searchInServer} from '@libs/actions/Report';
import {search, updateAdvancedFilters} from '@libs/actions/Search';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SearchFullscreenNavigatorParamList} from '@libs/Navigation/types';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {SearchResults} from '@src/types/onyx';
import SearchPageNarrow from './SearchPageNarrow';
import SearchPageWide from './SearchPageWide';

type SearchPageProps = PlatformStackScreenProps<SearchFullscreenNavigatorParamList, typeof SCREENS.SEARCH.ROOT>;

function SearchPage({route}: SearchPageProps) {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {selectedTransactions, lastSearchType, areAllMatchingItemsSelected, currentSearchKey, currentSearchResults} = useSearchStateContext();
    const {clearSelectedTransactions, setLastSearchType} = useSearchActionsContext();
    const isMobileSelectionModeEnabled = useMobileSelectionMode(clearSelectedTransactions);

    const queryJSON = useMemo(() => buildSearchQueryJSON(route.params.q, route.params.rawQuery), [route.params.q, route.params.rawQuery]);
    const {saveScrollOffset} = useContext(ScrollOffsetContext);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['SmartScan'] as const);

    const lastNonEmptySearchResults = useRef<SearchResults | undefined>(undefined);

    const formValues = useFilterFormValues(queryJSON);

    useEffect(() => {
        updateAdvancedFilters(formValues, true);
    }, [formValues]);

    useConfirmReadyToOpenApp();

    useEffect(() => {
        if (!currentSearchResults?.search?.type) {
            return;
        }

        setLastSearchType(currentSearchResults.search.type);
        if (currentSearchResults.data) {
            lastNonEmptySearchResults.current = currentSearchResults;
        }
    }, [lastSearchType, queryJSON, setLastSearchType, currentSearchResults]);

    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});

    const {initScanRequest, PDFValidationComponent, ErrorModal, isDragDisabled} = useReceiptScanDrop();
    const {resetVideoPlayerData} = usePlaybackActionsContext();

    const [isSorting, setIsSorting] = useState(false);
    let searchResults: SearchResults | undefined;
    if (currentSearchResults?.data) {
        searchResults = currentSearchResults;
    } else if (isSorting) {
        searchResults = lastNonEmptySearchResults.current;
    }

    const metadata = searchResults?.search;
    const shouldAllowFooterTotals = useSearchShouldCalculateTotals(currentSearchKey, queryJSON?.hash, true);
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
        const currency = metadata?.currency ?? selectedTransactionItems.at(0)?.groupCurrency;
        const numberOfExpense = shouldUseClientTotal
            ? selectedTransactionsKeys.reduce((count, key) => {
                  const item = selectedTransactions[key];
                  if (item.action === CONST.SEARCH.ACTION_TYPES.VIEW && key === item.reportID) {
                      return count;
                  }
                  return count + 1;
              }, 0)
            : metadata?.count;
        const total = shouldUseClientTotal ? selectedTransactionItems.reduce((acc, transaction) => acc - (transaction.groupAmount ?? 0), 0) : metadata?.total;

        return {count: numberOfExpense, total, currency};
    }, [areAllMatchingItemsSelected, metadata?.count, metadata?.currency, metadata?.total, selectedTransactions, selectedTransactionsKeys, shouldAllowFooterTotals]);

    const onSortPressedCallback = useCallback(() => {
        setIsSorting(true);
    }, []);

    const scrollHandler = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            if (!e.nativeEvent.contentOffset.y) {
                return;
            }

            saveScrollOffset(route, e.nativeEvent.contentOffset.y);
        },
        [saveScrollOffset, route],
    );

    return (
        <Animated.View style={[styles.flex1]}>
            {shouldUseNarrowLayout ? (
                <DragAndDropProvider isDisabled={isDragDisabled}>
                    {PDFValidationComponent}
                    <SearchPageNarrow
                        queryJSON={queryJSON}
                        metadata={metadata}
                        searchResults={searchResults}
                        isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                        footerData={footerData}
                        shouldShowFooter={shouldShowFooter}
                    />
                    <DragAndDropConsumer onDrop={initScanRequest}>
                        <DropZoneUI
                            icon={expensifyIcons.SmartScan}
                            dropTitle={translate('dropzone.scanReceipts')}
                            dropStyles={styles.receiptDropOverlay(true)}
                            dropTextStyles={styles.receiptDropText}
                            dropWrapperStyles={{marginBottom: variables.bottomTabHeight}}
                            dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.receiptDropBorderColorActive, true)]}
                        />
                    </DragAndDropConsumer>
                    {ErrorModal}
                </DragAndDropProvider>
            ) : (
                <SearchPageWide
                    queryJSON={queryJSON}
                    searchResults={searchResults}
                    searchRequestResponseStatusCode={searchRequestResponseStatusCode}
                    isMobileSelectionModeEnabled={isMobileSelectionModeEnabled}
                    footerData={footerData}
                    handleSearchAction={handleSearchAction}
                    onSortPressedCallback={onSortPressedCallback}
                    scrollHandler={scrollHandler}
                    initScanRequest={initScanRequest}
                    isDragDisabled={isDragDisabled}
                    PDFValidationComponent={PDFValidationComponent}
                    ErrorModal={ErrorModal}
                    shouldShowFooter={shouldShowFooter}
                />
            )}
        </Animated.View>
    );
}

SearchPage.whyDidYouRender = true;

export default SearchPage;

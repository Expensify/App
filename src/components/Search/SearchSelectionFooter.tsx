import React, {useCallback, useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import {search} from '@libs/actions/Search';
import {buildFlatQueryWithoutGroupBy} from '@libs/SearchQueryUtils';
import {isGroupEntry} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import {useSearchQueryContext, useSearchSelectionContext} from './SearchContext';
import SearchPageFooter from './SearchPageFooter';

type SearchSelectionFooterProps = {
    /** The (sorting-aware) results the page is displaying; source of the footer's totals metadata. */
    searchResults: OnyxEntry<SearchResults>;
};

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

    const memberValue: unknown = Reflect.get(value, memberName);
    return typeof memberValue === 'number' ? memberValue : undefined;
}

// Self-subscribing footer leaf. Owns the `selectedTransactions` read so a checkbox press re-renders only this
// footer — not SearchPage and the <Search> list it contains.
function SearchSelectionFooter({searchResults}: SearchSelectionFooterProps) {
    const {selectedTransactions, areAllMatchingItemsSelected} = useSearchSelectionContext();
    const {currentSearchHash, currentSearchKey, currentSearchQueryJSON} = useSearchQueryContext();
    const shouldAllowFooterTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true);
    const [footerCurrencyState, setFooterCurrencyState] = useState<FooterCurrencyState>({
        searchHash: undefined,
        selectedCurrency: undefined,
        defaultCurrency: undefined,
        footerTotalHash: undefined,
    });
    const isCurrentFooterState = footerCurrencyState.searchHash === currentSearchHash;
    const selectedCurrency = isCurrentFooterState ? footerCurrencyState.selectedCurrency : undefined;
    const defaultFooterCurrency = isCurrentFooterState ? footerCurrencyState.defaultCurrency : undefined;
    const [footerTotalSnapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${footerCurrencyState.footerTotalHash}`);
    const footerTotalMetadata = isCurrentFooterState && footerCurrencyState.footerTotalHash !== undefined ? footerTotalSnapshot?.search : undefined;
    const footerTotalData = footerTotalSnapshot?.data;

    const metadata = searchResults?.search;
    const metadataCount = metadata?.count;
    const metadataCurrency = metadata?.currency;
    const metadataTotal = metadata?.total;
    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});
    const shouldShowFooter = (!areAllMatchingItemsSelected && selectedTransactionsKeys.length > 0) || (shouldAllowFooterTotals && !!metadata?.count);

    const handleFooterCurrencyChange = useCallback(
        (currency: string | undefined) => {
            const fallbackDefaultCurrency = defaultFooterCurrency ?? metadataCurrency;
            const nextCurrency = currency ?? fallbackDefaultCurrency;
            if (!currentSearchQueryJSON || !nextCurrency) {
                return;
            }

            const isResettingToDefault = nextCurrency === fallbackDefaultCurrency;
            // Fetch converted footer totals in a currency-scoped snapshot so the live search snapshot stays in its original currency.
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

            search({
                queryJSON: flatQueryJSON,
                searchKey: undefined,
                offset: 0,
                shouldCalculateTotals: true,
                isLoading: false,
                targetCurrency: nextCurrency,
            });
        },
        [currentSearchHash, currentSearchQueryJSON, defaultFooterCurrency, metadataCurrency],
    );

    const footerData = useMemo(() => {
        if (!shouldAllowFooterTotals && selectedTransactionsKeys.length === 0) {
            return {count: undefined, total: undefined, currency: undefined, isLoading: false};
        }

        const selectedTransactionItems = Object.values(selectedTransactions);
        const selectedExpenseCount = selectedTransactionsKeys.reduce((count, key) => {
            if (isGroupEntry(key)) {
                const group: unknown = searchResults?.data?.[key];
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
                const convertedTransaction: unknown = footerTotalData?.[convertedTransactionKey];
                return getNumberMember(convertedTransaction, 'groupAmount') !== undefined;
            });
        const shouldUseConvertedSelectedTotal = canConvertSelectedTotal && areAllSelectedRowsConverted;
        // Custom-currency totals need a backend conversion round-trip, so show loading whenever that conversion snapshot is in flight.
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

        const count = shouldUseClientTotal ? selectedExpenseCount : metadataCount;
        let total;
        if (shouldUseClientTotal) {
            total = selectedTransactionsKeys.reduce((acc, key) => {
                const transaction = selectedTransactions[key];
                const convertedTransactionKey = transaction.transaction?.transactionID ? `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transaction.transactionID}` : key;
                const convertedTransaction: unknown = shouldUseConvertedSelectedTotal && footerTotalData ? footerTotalData[convertedTransactionKey] : undefined;
                return acc - (getNumberMember(convertedTransaction, 'groupAmount') ?? transaction.groupAmount ?? -Math.abs(transaction.amount));
            }, 0);
        } else if (hasCustomFooterCurrency) {
            total = isServerTotalConfirmed ? footerTotalMetadata?.total : metadataTotal;
        } else {
            total = metadataTotal;
        }

        return {count, total, currency, isLoading: isFooterTotalConverting};
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
        searchResults?.data,
        selectedCurrency,
        selectedTransactions,
        selectedTransactionsKeys,
        shouldAllowFooterTotals,
    ]);

    if (!shouldShowFooter) {
        return null;
    }

    // Load-more requests also set metadata.isLoading, but they do not recalculate totals.
    // Only offset-0 refreshes should put the footer total into loading state.
    const isFooterTotalLoading = !!footerData.isLoading || (!!metadata?.isLoading && metadata?.offset === 0);

    return (
        <SearchPageFooter
            count={footerData.count}
            total={footerData.total}
            currency={footerData.currency}
            defaultCurrency={defaultFooterCurrency ?? metadata?.currency}
            isTotalLoading={isFooterTotalLoading}
            onCurrencyChange={handleFooterCurrencyChange}
        />
    );
}

export default SearchSelectionFooter;

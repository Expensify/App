import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import {getFooterConvertedAmounts} from '@libs/actions/Search';
import {isGroupEntry} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import type SearchFooterConversion from '@src/types/onyx/SearchFooterConversion';
import {useSearchQueryContext, useSearchSelectionContext} from './SearchContext';
import SearchPageFooter from './SearchPageFooter';
import type {SelectedTransactions} from './types';

type SearchSelectionFooterProps = {
    /** The (sorting-aware) results the page is displaying; source of the footer's totals metadata. */
    searchResults: OnyxEntry<SearchResults>;
};

type FooterCurrencyState = {
    /** Search hash this footer currency state belongs to */
    searchHash: number | undefined;

    /** Custom currency selected in the footer, if any */
    selectedCurrency: string | undefined;

    /** Default currency captured for this search */
    defaultCurrency: string | undefined;
};

function getObjectMember(value: unknown, memberName: string): unknown {
    if (!value || typeof value !== 'object') {
        return undefined;
    }

    return Reflect.get(value, memberName);
}

function getNumberMember(value: unknown, memberName: string): number | undefined {
    const memberValue = getObjectMember(value, memberName);
    return typeof memberValue === 'number' ? memberValue : undefined;
}

// Every selected expense has a converted amount cached for the target currency, so the selected total can be
// shown in that currency. Report-view rows carry no transaction of their own and are ignored.
function areAllSelectedExpensesConverted(selectedTransactions: SelectedTransactions, convertedTransactions: SearchFooterConversion['transactions'], currency: string): boolean {
    return Object.keys(selectedTransactions).every((key) => {
        const transaction = selectedTransactions[key];
        if (transaction.action === CONST.SEARCH.ACTION_TYPES.VIEW && key === transaction.reportID) {
            return true;
        }

        const transactionID = transaction.transaction?.transactionID;
        if (!transactionID) {
            return false;
        }

        return convertedTransactions?.[transactionID]?.[currency] !== undefined;
    });
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
    });
    const isCurrentFooterState = footerCurrencyState.searchHash === currentSearchHash;
    const selectedCurrency = isCurrentFooterState ? footerCurrencyState.selectedCurrency : undefined;
    const defaultFooterCurrency = isCurrentFooterState ? footerCurrencyState.defaultCurrency : undefined;

    // The Auth command merges converted figures here (by transaction and by query hash, each nested under the
    // target currency); the live search snapshot stays in its original currency.
    const [footerConversion] = useOnyx(ONYXKEYS.SEARCH_FOOTER_CONVERSION);
    const convertedTransactions = footerConversion?.transactions;
    const convertedSearchTotal = currentSearchHash !== undefined ? footerConversion?.searchTotals?.[currentSearchHash] : undefined;

    const metadata = searchResults?.search;
    const metadataCount = metadata?.count;
    const metadataCurrency = metadata?.currency;
    const metadataTotal = metadata?.total;
    const isMetadataLoading = !!metadata?.isLoading;
    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});
    const hasSelectedGroup = selectedTransactionsKeys.some(isGroupEntry);
    const selectedExpenseCount = useMemo(
        () =>
            selectedTransactionsKeys.reduce((count, key) => {
                if (isGroupEntry(key)) {
                    const group: unknown = searchResults?.data?.[key];
                    return count + (getNumberMember(group, 'count') ?? 0);
                }
                const item = selectedTransactions[key];
                if (item.action === CONST.SEARCH.ACTION_TYPES.VIEW && key === item.reportID) {
                    return count;
                }
                return count + 1;
            }, 0),
        [searchResults?.data, selectedTransactions, selectedTransactionsKeys],
    );
    const selectedTransactionIDs = useMemo(
        () => selectedTransactionsKeys.map((key) => selectedTransactions[key]?.transaction?.transactionID).filter((transactionID): transactionID is string => !!transactionID),
        [selectedTransactions, selectedTransactionsKeys],
    );
    const areAllSelectedForFooter = areAllMatchingItemsSelected || (selectedTransactionsKeys.length > 0 && metadataCount !== undefined && selectedExpenseCount === metadataCount);
    const hasPartialSelection = selectedTransactionsKeys.length > 0 && !areAllSelectedForFooter;
    const shouldUseClientTotal = !metadataCount || hasPartialSelection;
    const firstSelectedTransactionKey = selectedTransactionsKeys.at(0);
    const firstSelectedTransaction = firstSelectedTransactionKey ? selectedTransactions[firstSelectedTransactionKey] : undefined;
    const selectedTransactionDefaultCurrency = firstSelectedTransaction?.groupCurrency ?? firstSelectedTransaction?.currency;
    const effectiveDefaultCurrency = defaultFooterCurrency ?? metadataCurrency ?? selectedTransactionDefaultCurrency;
    const hasCustomFooterCurrency = !!selectedCurrency && selectedCurrency !== effectiveDefaultCurrency;

    const selectedCurrencyConvertedTotal = hasCustomFooterCurrency && selectedCurrency ? convertedSearchTotal?.[selectedCurrency] : undefined;
    const areAllSelectedConverted = useMemo(
        () => hasCustomFooterCurrency && !!selectedCurrency && areAllSelectedExpensesConverted(selectedTransactions, convertedTransactions, selectedCurrency),
        [convertedTransactions, hasCustomFooterCurrency, selectedCurrency, selectedTransactions],
    );

    // While a custom currency is chosen but its converted figures have not arrived yet, the footer keeps showing
    // the default-currency total behind a skeleton until the cache fills.
    const isFooterTotalConverting = hasCustomFooterCurrency && (shouldUseClientTotal ? !areAllSelectedConverted : !selectedCurrencyConvertedTotal);

    const shouldShowFooter = (!areAllMatchingItemsSelected && selectedTransactionsKeys.length > 0) || (shouldAllowFooterTotals && !!metadata?.count);
    const wasMetadataLoading = usePrevious(isMetadataLoading);

    const shouldResetCustomCurrencyAfterLiveRefresh = hasCustomFooterCurrency && !!wasMetadataLoading && !isMetadataLoading && metadata?.offset === 0;
    const shouldResetCustomCurrencyForGroupSelection = hasSelectedGroup && !!selectedCurrency;
    if (shouldResetCustomCurrencyAfterLiveRefresh || shouldResetCustomCurrencyForGroupSelection) {
        setFooterCurrencyState({
            searchHash: currentSearchHash,
            selectedCurrency: undefined,
            defaultCurrency: effectiveDefaultCurrency,
        });
    }

    // Fetch converted figures whenever a custom currency is chosen and the cache does not yet cover what the
    // footer needs: the whole-search total when nothing/everything is selected, or the selected rows otherwise.
    // The cache check keeps this to one request per out-of-coverage change rather than one per checkbox.
    useEffect(() => {
        if (!hasCustomFooterCurrency || !currentSearchQueryJSON || !selectedCurrency) {
            return;
        }

        if (shouldUseClientTotal) {
            if (!areAllSelectedConverted && selectedTransactionIDs.length > 0) {
                getFooterConvertedAmounts({queryJSON: currentSearchQueryJSON, targetCurrency: selectedCurrency, transactionIDList: selectedTransactionIDs.join(',')});
            }
            return;
        }

        if (!selectedCurrencyConvertedTotal) {
            getFooterConvertedAmounts({queryJSON: currentSearchQueryJSON, targetCurrency: selectedCurrency});
        }
    }, [areAllSelectedConverted, currentSearchQueryJSON, hasCustomFooterCurrency, selectedCurrency, selectedCurrencyConvertedTotal, selectedTransactionIDs, shouldUseClientTotal]);

    const handleFooterCurrencyChange = useCallback(
        (currency: string | undefined) => {
            setFooterCurrencyState({
                searchHash: currentSearchHash,
                selectedCurrency: currency,
                defaultCurrency: effectiveDefaultCurrency,
            });
        },
        [currentSearchHash, effectiveDefaultCurrency],
    );

    const footerData = useMemo(() => {
        if (!shouldAllowFooterTotals && selectedTransactionsKeys.length === 0) {
            return {count: undefined, total: undefined, currency: undefined};
        }

        const selectedTransactionItems = Object.values(selectedTransactions);
        const fallbackCurrency = effectiveDefaultCurrency ?? selectedTransactionItems.at(0)?.groupCurrency ?? selectedTransactionItems.at(0)?.currency;

        if (shouldUseClientTotal) {
            const shouldUseConvertedSelectedTotal = hasCustomFooterCurrency && areAllSelectedConverted && !!selectedCurrency;
            const total = selectedTransactionsKeys.reduce((acc, key) => {
                const transaction = selectedTransactions[key];
                const transactionID = transaction.transaction?.transactionID;
                const convertedAmount = shouldUseConvertedSelectedTotal && selectedCurrency && transactionID ? convertedTransactions?.[transactionID]?.[selectedCurrency] : undefined;
                return acc - (convertedAmount ?? transaction.groupAmount ?? -Math.abs(transaction.amount));
            }, 0);

            return {count: selectedExpenseCount, total, currency: shouldUseConvertedSelectedTotal ? selectedCurrency : fallbackCurrency};
        }

        if (hasCustomFooterCurrency && selectedCurrencyConvertedTotal) {
            return {count: selectedCurrencyConvertedTotal.count, total: selectedCurrencyConvertedTotal.total, currency: selectedCurrency};
        }

        return {count: metadataCount, total: metadataTotal, currency: effectiveDefaultCurrency ?? metadataCurrency};
    }, [
        areAllSelectedConverted,
        convertedTransactions,
        effectiveDefaultCurrency,
        hasCustomFooterCurrency,
        metadataCount,
        metadataCurrency,
        metadataTotal,
        selectedCurrency,
        selectedCurrencyConvertedTotal,
        selectedExpenseCount,
        selectedTransactions,
        selectedTransactionsKeys,
        shouldAllowFooterTotals,
        shouldUseClientTotal,
    ]);

    if (!shouldShowFooter) {
        return null;
    }

    // Load-more requests also set metadata.isLoading, but they do not recalculate totals.
    // Only offset-0 refreshes should put the footer total into loading state.
    const isFooterTotalLoading = isFooterTotalConverting || (!!metadata?.isLoading && metadata?.offset === 0);

    return (
        <SearchPageFooter
            count={footerData.count}
            total={footerData.total}
            currency={footerData.currency}
            defaultCurrency={effectiveDefaultCurrency}
            isTotalLoading={isFooterTotalLoading}
            onCurrencyChange={handleFooterCurrencyChange}
            shouldAllowCurrencyChange={!hasSelectedGroup}
        />
    );
}

export default SearchSelectionFooter;

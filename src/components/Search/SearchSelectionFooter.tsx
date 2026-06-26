import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
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

function getGroupCount(group: unknown): number {
    if (group && typeof group === 'object' && 'count' in group && typeof group.count === 'number') {
        return group.count;
    }

    return 0;
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

// On the Reports search a selection is converted by report, so every selected report needs a cached converted
// total for the target currency before the selected total can be shown in that currency.
function areAllSelectedReportsConverted(selectedReportIDs: string[], convertedReports: SearchFooterConversion['reports'], currency: string): boolean {
    return selectedReportIDs.every((reportID) => convertedReports?.[reportID]?.[currency] !== undefined);
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
    const convertedReports = footerConversion?.reports;
    const convertedSearchTotal = footerConversion?.searchTotals?.[currentSearchHash];

    // On the Reports search the rows are reports, so a selection is converted by report rather than by
    // transaction (each report's full total, summed from its transactions converted at their own dates).
    const isReportsSearch = currentSearchQueryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

    const metadata = searchResults?.search;
    const metadataCount = metadata?.count;
    const metadataCurrency = metadata?.currency;
    const metadataTotal = metadata?.total;
    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? {});
    const hasSelectedGroup = selectedTransactionsKeys.some(isGroupEntry);
    const selectedExpenseCount = useMemo(
        () =>
            selectedTransactionsKeys.reduce((count, key) => {
                if (isGroupEntry(key)) {
                    const group: unknown = searchResults?.data?.[key];
                    return count + getGroupCount(group);
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
    const selectedReportIDs = useMemo(
        () => Array.from(new Set(selectedTransactionsKeys.map((key) => selectedTransactions[key]?.reportID).filter((reportID): reportID is string => !!reportID))),
        [selectedTransactions, selectedTransactionsKeys],
    );
    // The IDs the current search converts a selection by: reports on the Reports search, transactions elsewhere.
    const selectedConvertibleIDs = isReportsSearch ? selectedReportIDs : selectedTransactionIDs;
    const areAllSelectedForFooter = areAllMatchingItemsSelected || (selectedTransactionsKeys.length > 0 && metadataCount !== undefined && selectedExpenseCount === metadataCount);
    const hasPartialSelection = selectedTransactionsKeys.length > 0 && !areAllSelectedForFooter;
    const shouldUseClientTotal = !metadataCount || hasPartialSelection;
    const firstSelectedTransactionKey = selectedTransactionsKeys.at(0);
    const firstSelectedTransaction = firstSelectedTransactionKey ? selectedTransactions[firstSelectedTransactionKey] : undefined;
    const selectedTransactionDefaultCurrency = firstSelectedTransaction?.groupCurrency ?? firstSelectedTransaction?.currency;
    const effectiveDefaultCurrency = defaultFooterCurrency ?? metadataCurrency ?? selectedTransactionDefaultCurrency;
    const hasCustomFooterCurrency = !!selectedCurrency && selectedCurrency !== effectiveDefaultCurrency;

    const selectedCurrencyConvertedTotal = hasCustomFooterCurrency && selectedCurrency ? convertedSearchTotal?.[selectedCurrency] : undefined;
    const areAllSelectedConverted = useMemo(() => {
        if (!hasCustomFooterCurrency || !selectedCurrency) {
            return false;
        }
        return isReportsSearch
            ? areAllSelectedReportsConverted(selectedReportIDs, convertedReports, selectedCurrency)
            : areAllSelectedExpensesConverted(selectedTransactions, convertedTransactions, selectedCurrency);
    }, [convertedReports, convertedTransactions, hasCustomFooterCurrency, isReportsSearch, selectedCurrency, selectedReportIDs, selectedTransactions]);

    // While a custom currency is chosen but its converted figures have not arrived yet, the footer keeps showing
    // the default-currency total behind a skeleton until the cache fills. A partial selection can only convert once
    // it has IDs to fetch, so a selection with none to convert stays on the default total instead of a skeleton
    // that would never resolve.
    const isFooterTotalConverting = hasCustomFooterCurrency && (shouldUseClientTotal ? selectedConvertibleIDs.length > 0 && !areAllSelectedConverted : !selectedCurrencyConvertedTotal);

    const shouldShowFooter = (!areAllMatchingItemsSelected && selectedTransactionsKeys.length > 0) || (shouldAllowFooterTotals && !!metadata?.count);

    // A group selection disables the picker, so drop any custom currency chosen before the group was selected.
    if (hasSelectedGroup && selectedCurrency) {
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
            if (areAllSelectedConverted || selectedConvertibleIDs.length === 0) {
                return;
            }
            if (isReportsSearch) {
                getFooterConvertedAmounts({queryJSON: currentSearchQueryJSON, targetCurrency: selectedCurrency, reportIDList: selectedConvertibleIDs.join(',')});
            } else {
                getFooterConvertedAmounts({queryJSON: currentSearchQueryJSON, targetCurrency: selectedCurrency, transactionIDList: selectedConvertibleIDs.join(',')});
            }
            return;
        }

        if (!selectedCurrencyConvertedTotal) {
            getFooterConvertedAmounts({queryJSON: currentSearchQueryJSON, targetCurrency: selectedCurrency});
        }
    }, [
        areAllSelectedConverted,
        currentSearchQueryJSON,
        hasCustomFooterCurrency,
        isReportsSearch,
        selectedCurrency,
        selectedCurrencyConvertedTotal,
        selectedConvertibleIDs,
        shouldUseClientTotal,
    ]);

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

            // On the Reports search, the converted total sums each selected report's cached converted total; on
            // other searches it sums each selected transaction's converted amount. Both fall back to the default
            // per-row amounts when the conversion isn't ready, keeping the footer on the default currency.
            let total;
            if (shouldUseConvertedSelectedTotal && isReportsSearch && selectedCurrency) {
                total = selectedReportIDs.reduce((acc, reportID) => acc - (convertedReports?.[reportID]?.[selectedCurrency] ?? 0), 0);
            } else {
                total = selectedTransactionsKeys.reduce((acc, key) => {
                    const transaction = selectedTransactions[key];
                    const transactionID = transaction.transaction?.transactionID;
                    const convertedAmount =
                        shouldUseConvertedSelectedTotal && !isReportsSearch && selectedCurrency && transactionID ? convertedTransactions?.[transactionID]?.[selectedCurrency] : undefined;
                    return acc - (convertedAmount ?? transaction.groupAmount ?? -Math.abs(transaction.amount));
                }, 0);
            }

            return {count: selectedExpenseCount, total, currency: shouldUseConvertedSelectedTotal ? selectedCurrency : fallbackCurrency};
        }

        if (hasCustomFooterCurrency && selectedCurrencyConvertedTotal) {
            return {count: selectedCurrencyConvertedTotal.count, total: selectedCurrencyConvertedTotal.total, currency: selectedCurrency};
        }

        return {count: metadataCount, total: metadataTotal, currency: effectiveDefaultCurrency ?? metadataCurrency};
    }, [
        areAllSelectedConverted,
        convertedReports,
        convertedTransactions,
        effectiveDefaultCurrency,
        hasCustomFooterCurrency,
        isReportsSearch,
        metadataCount,
        metadataCurrency,
        metadataTotal,
        selectedCurrency,
        selectedCurrencyConvertedTotal,
        selectedExpenseCount,
        selectedReportIDs,
        selectedTransactions,
        selectedTransactionsKeys,
        shouldAllowFooterTotals,
        shouldUseClientTotal,
    ]);

    if (!shouldShowFooter) {
        return null;
    }

    // A partial selection shows a client-side subtotal that is ready immediately, so only show the search-loading
    // skeleton when the footer is displaying the whole-search total. (Load-more requests also set metadata.isLoading
    // but don't recalculate totals, so gate on offset 0.)
    const isFooterTotalLoading = isFooterTotalConverting || (!hasPartialSelection && !!metadata?.isLoading && metadata?.offset === 0);

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

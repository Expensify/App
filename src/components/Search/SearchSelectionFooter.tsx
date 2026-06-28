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

// Every selected row needs a cached converted amount for the target currency before the selected total can be shown
// in that currency. A whole-group selection converts by group; an individual row converts by its transaction (so a
// grouped selection can mix the two). Report-view rows carry no transaction of their own and are ignored.
function areAllSelectedEntriesConverted(
    selectedTransactions: SelectedTransactions,
    convertedGroups: SearchFooterConversion['groups'],
    convertedTransactions: SearchFooterConversion['transactions'],
    currency: string,
): boolean {
    return Object.keys(selectedTransactions).every((key) => {
        if (isGroupEntry(key)) {
            return convertedGroups?.[key]?.[currency] !== undefined;
        }

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

// The Reports search converts a selection by report, so every selected report needs a cached converted total.
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

    // The Auth command merges converted figures here (by transaction, report, group, and query hash, each nested
    // under the target currency); the live search snapshot stays in its original currency.
    const [footerConversion] = useOnyx(ONYXKEYS.SEARCH_FOOTER_CONVERSION);
    const convertedTransactions = footerConversion?.transactions;
    const convertedReports = footerConversion?.reports;
    const convertedGroups = footerConversion?.groups;
    const convertedSearchTotal = footerConversion?.searchTotals?.[currentSearchHash];

    // The Reports search converts a selection by report. Other searches convert per row — by group for a whole-group
    // selection (grouped views) and by transaction otherwise — so a grouped selection can mix whole groups and
    // individual transactions from other groups.
    const isReportsSearch = currentSearchQueryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;
    const isGroupedSearch = !isReportsSearch && !!currentSearchQueryJSON?.groupBy;

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
    // Individually-selected transactions (loose rows in a grouped view, or every row on a flat search).
    const selectedTransactionIDs = useMemo(
        () => selectedTransactionsKeys.map((key) => selectedTransactions[key]?.transaction?.transactionID).filter((transactionID): transactionID is string => !!transactionID),
        [selectedTransactions, selectedTransactionsKeys],
    );
    const selectedReportIDs = useMemo(
        () => Array.from(new Set(selectedTransactionsKeys.map((key) => selectedTransactions[key]?.reportID).filter((reportID): reportID is string => !!reportID))),
        [selectedTransactions, selectedTransactionsKeys],
    );
    const selectedGroupKeys = useMemo(() => selectedTransactionsKeys.filter(isGroupEntry), [selectedTransactionsKeys]);

    const areAllSelectedForFooter = areAllMatchingItemsSelected || (selectedTransactionsKeys.length > 0 && metadataCount !== undefined && selectedExpenseCount === metadataCount);
    const hasPartialSelection = selectedTransactionsKeys.length > 0 && !areAllSelectedForFooter;
    // Use the per-selection (client) total for a partial selection; nothing-selected and everything-selected both fall
    // to the whole-search grand total, which every search type now returns converted, keyed by the search hash.
    const shouldUseClientTotal = !metadataCount || hasPartialSelection;
    const firstSelectedTransactionKey = selectedTransactionsKeys.at(0);
    const firstSelectedTransaction = firstSelectedTransactionKey ? selectedTransactions[firstSelectedTransactionKey] : undefined;
    const selectedTransactionDefaultCurrency = firstSelectedTransaction?.groupCurrency ?? firstSelectedTransaction?.currency;
    const effectiveDefaultCurrency = defaultFooterCurrency ?? metadataCurrency ?? selectedTransactionDefaultCurrency;
    const hasCustomFooterCurrency = !!selectedCurrency && selectedCurrency !== effectiveDefaultCurrency;

    const selectedCurrencyConvertedTotal = hasCustomFooterCurrency && selectedCurrency ? convertedSearchTotal?.[selectedCurrency] : undefined;

    // Whether the selection has anything to convert per-row: reports on the Reports search, otherwise selected whole
    // groups and/or individual transactions.
    const hasConvertibleSelection = isReportsSearch ? selectedReportIDs.length > 0 : selectedGroupKeys.length > 0 || selectedTransactionIDs.length > 0;

    const areAllSelectedConverted = useMemo(() => {
        if (!hasCustomFooterCurrency || !selectedCurrency) {
            return false;
        }
        return isReportsSearch
            ? areAllSelectedReportsConverted(selectedReportIDs, convertedReports, selectedCurrency)
            : areAllSelectedEntriesConverted(selectedTransactions, convertedGroups, convertedTransactions, selectedCurrency);
    }, [convertedGroups, convertedReports, convertedTransactions, hasCustomFooterCurrency, isReportsSearch, selectedCurrency, selectedReportIDs, selectedTransactions]);

    // While a custom currency is chosen but its converted figures haven't arrived, the footer keeps showing the
    // default-currency total behind a skeleton until the cache fills — but only when there's something to convert, so
    // a selection with nothing convertible stays on the default total rather than a skeleton that never resolves.
    const isFooterTotalConverting = hasCustomFooterCurrency && (shouldUseClientTotal ? hasConvertibleSelection && !areAllSelectedConverted : !selectedCurrencyConvertedTotal);

    const shouldShowFooter = (!areAllMatchingItemsSelected && selectedTransactionsKeys.length > 0) || (shouldAllowFooterTotals && !!metadata?.count);

    // A grouped search converts its group selections via the groups path, so it keeps the picker. A selected group
    // anywhere else (e.g. a stray report-view group) can't be converted, so there the picker is disabled and any
    // custom currency is dropped.
    const hasUnconvertibleGroupSelection = hasSelectedGroup && !isGroupedSearch;
    if (hasUnconvertibleGroupSelection && selectedCurrency) {
        setFooterCurrencyState({
            searchHash: currentSearchHash,
            selectedCurrency: undefined,
            defaultCurrency: effectiveDefaultCurrency,
        });
    }

    // Fetch converted figures whenever a custom currency is chosen and the cache does not yet cover what the footer
    // needs. The cache check keeps this to one request per out-of-coverage change rather than one per checkbox.
    useEffect(() => {
        if (!hasCustomFooterCurrency || !currentSearchQueryJSON || !selectedCurrency) {
            return;
        }

        if (shouldUseClientTotal) {
            if (areAllSelectedConverted) {
                return;
            }
            if (isReportsSearch) {
                if (selectedReportIDs.length > 0) {
                    getFooterConvertedAmounts({queryJSON: currentSearchQueryJSON, targetCurrency: selectedCurrency, reportIDList: selectedReportIDs.join(',')});
                }
                return;
            }
            // Selected whole groups: one grouped request (derived from the query's groupBy) returns every group's
            // converted total, so no ID list is sent.
            if (selectedGroupKeys.some((key) => convertedGroups?.[key]?.[selectedCurrency] === undefined)) {
                getFooterConvertedAmounts({queryJSON: currentSearchQueryJSON, targetCurrency: selectedCurrency});
            }
            // Individually-selected transactions convert by transaction ID (the loose rows in a grouped view, or the
            // whole selection on a flat search).
            if (selectedTransactionIDs.some((transactionID) => convertedTransactions?.[transactionID]?.[selectedCurrency] === undefined)) {
                getFooterConvertedAmounts({queryJSON: currentSearchQueryJSON, targetCurrency: selectedCurrency, transactionIDList: selectedTransactionIDs.join(',')});
            }
            return;
        }

        // Nothing/everything selected: fetch the whole-search converted grand total (returned keyed by the search
        // hash — flat via the window total, reports via searchTotalsMetadata, grouped via the summed groups).
        if (!selectedCurrencyConvertedTotal) {
            getFooterConvertedAmounts({queryJSON: currentSearchQueryJSON, targetCurrency: selectedCurrency});
        }
    }, [
        areAllSelectedConverted,
        convertedGroups,
        convertedTransactions,
        currentSearchQueryJSON,
        hasCustomFooterCurrency,
        isReportsSearch,
        selectedCurrency,
        selectedCurrencyConvertedTotal,
        selectedGroupKeys,
        selectedReportIDs,
        selectedTransactionIDs,
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

            // Reports sum each selected report's converted total; other searches sum per row — whole groups from the
            // groups cache, individual transactions from the transactions cache — falling back to the default per-row
            // amount until the conversion is ready, which keeps the footer on the default currency meanwhile.
            let total;
            if (shouldUseConvertedSelectedTotal && isReportsSearch && selectedCurrency) {
                total = selectedReportIDs.reduce((acc, reportID) => acc - (convertedReports?.[reportID]?.[selectedCurrency] ?? 0), 0);
            } else {
                total = selectedTransactionsKeys.reduce((acc, key) => {
                    const transaction = selectedTransactions[key];
                    let convertedAmount;
                    if (shouldUseConvertedSelectedTotal && selectedCurrency) {
                        if (isGroupEntry(key)) {
                            convertedAmount = convertedGroups?.[key]?.[selectedCurrency];
                        } else if (transaction.transaction?.transactionID) {
                            convertedAmount = convertedTransactions?.[transaction.transaction.transactionID]?.[selectedCurrency];
                        }
                    }
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
        convertedGroups,
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
            shouldAllowCurrencyChange={!hasUnconvertibleGroupSelection}
        />
    );
}

export default SearchSelectionFooter;

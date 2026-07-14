import useOnyx from '@hooks/useOnyx';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';

import {getFooterConvertedAmounts} from '@libs/actions/Search';
import {isGroupEntry} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useCallback, useEffect, useMemo, useState} from 'react';

import type {SelectedTransactionInfo, SelectedTransactions} from './types';

import {useSearchQueryContext, useSearchResultsContext, useSearchSelectionContext} from './SearchContext';
import SearchPageFooter from './SearchPageFooter';

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

// The live default-currency figure a row contributes to the footer total (also what the footer falls back to before a
// conversion arrives). The footer stamps each conversion against this value and compares it on every render, so an
// inline edit that moves it is detected and the cached conversion is refetched.
function getEntrySource(entry: SelectedTransactionInfo): number {
    return entry.groupAmount ?? -Math.abs(entry.amount);
}

// Every selected row needs a fresh cached conversion for the target currency before the selected total can be shown
// in that currency. A whole-group selection converts by group; an individual row converts by its transaction (so a
// grouped selection can mix the two). Report-view rows carry no transaction of their own and are ignored.
function areAllSelectedEntriesConverted(selectedTransactions: SelectedTransactions, isGroupFresh: (key: string) => boolean, isTransactionFresh: (transactionID: string) => boolean): boolean {
    return Object.keys(selectedTransactions).every((key) => {
        if (isGroupEntry(key)) {
            return isGroupFresh(key);
        }

        const transaction = selectedTransactions[key];
        if (transaction.action === CONST.SEARCH.ACTION_TYPES.VIEW && key === transaction.reportID) {
            return true;
        }

        const transactionID = transaction.transaction?.transactionID;
        if (!transactionID) {
            return false;
        }

        return isTransactionFresh(transactionID);
    });
}

// The Reports search converts a selection by report, so every selected report needs a fresh cached converted total.
function areAllSelectedReportsConverted(selectedReportIDs: string[], isReportFresh: (reportID: string) => boolean): boolean {
    return selectedReportIDs.every(isReportFresh);
}

// Self-subscribing footer leaf. Owns the `selectedTransactions` read so a checkbox press re-renders only this
// footer — not SearchPage and the <Search> list it contains.
function SearchSelectionFooter({searchResults}: SearchSelectionFooterProps) {
    const {selectedTransactions, areAllMatchingItemsSelected, selectedReports} = useSearchSelectionContext();
    const {currentSearchResults} = useSearchResultsContext();
    const {currentSearchHash, currentSearchKey, currentSearchQueryJSON} = useSearchQueryContext();
    const shouldAllowFooterTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true, areAllMatchingItemsSelected);
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
    // Source figures the footer stamped each conversion against. A conversion is "fresh" only while its stamped source
    // still equals the live snapshot value; an inline edit moves the live value and makes the conversion stale.
    const conversionSources = footerConversion?.sources;

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
                    const group: unknown = currentSearchResults?.data?.[key];
                    return count + getGroupCount(group);
                }
                const item = selectedTransactions[key];
                if (item.action === CONST.SEARCH.ACTION_TYPES.VIEW && key === item.reportID) {
                    return count;
                }
                return count + 1;
            }, 0),
        [currentSearchResults?.data, selectedTransactions, selectedTransactionsKeys],
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

    // Live default-currency source figures, keyed the same way as the conversion cache, captured from the current
    // selection/snapshot on every render. The freshness checks below compare these to the figures stamped when each
    // conversion was requested.
    const transactionSourceByID = useMemo(() => {
        const sources: Record<string, number> = {};
        for (const key of selectedTransactionsKeys) {
            const transactionID = selectedTransactions[key]?.transaction?.transactionID;
            if (!isGroupEntry(key) && transactionID) {
                sources[transactionID] = getEntrySource(selectedTransactions[key]);
            }
        }
        return sources;
    }, [selectedTransactions, selectedTransactionsKeys]);
    const groupSourceByKey = useMemo(() => {
        const sources: Record<string, number> = {};
        for (const key of selectedGroupKeys) {
            sources[key] = getEntrySource(selectedTransactions[key]);
        }
        return sources;
    }, [selectedGroupKeys, selectedTransactions]);
    const reportSourceByID = useMemo(() => {
        const sources: Record<string, number> = {};
        for (const report of selectedReports) {
            if (report.reportID) {
                sources[report.reportID] = report.total;
            }
        }
        return sources;
    }, [selectedReports]);

    // A conversion is fresh only when its converted figure is cached AND the source it was stamped against still equals
    // the live source — so an inline edit that moves the live source makes it stale and triggers a refetch below.
    const isTransactionFresh = useCallback(
        (transactionID: string, currency: string) =>
            convertedTransactions?.[transactionID]?.[currency] !== undefined && conversionSources?.transactions?.[transactionID]?.[currency] === transactionSourceByID[transactionID],
        [conversionSources, convertedTransactions, transactionSourceByID],
    );
    const isGroupFresh = useCallback(
        (key: string, currency: string) => convertedGroups?.[key]?.[currency] !== undefined && conversionSources?.groups?.[key]?.[currency] === groupSourceByKey[key],
        [conversionSources, convertedGroups, groupSourceByKey],
    );
    const isReportFresh = useCallback(
        (reportID: string, currency: string) => convertedReports?.[reportID]?.[currency] !== undefined && conversionSources?.reports?.[reportID]?.[currency] === reportSourceByID[reportID],
        [conversionSources, convertedReports, reportSourceByID],
    );

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
    // The whole-search grand total is fresh only while its stamped source still equals the live snapshot total.
    const isSearchTotalFresh = !!selectedCurrencyConvertedTotal && !!selectedCurrency && conversionSources?.searchTotals?.[currentSearchHash]?.[selectedCurrency] === metadataTotal;

    // Whether the selection has anything to convert per-row: reports on the Reports search, otherwise selected whole
    // groups and/or individual transactions.
    const hasConvertibleSelection = isReportsSearch ? selectedReportIDs.length > 0 : selectedGroupKeys.length > 0 || selectedTransactionIDs.length > 0;

    const areAllSelectedConverted = useMemo(() => {
        if (!hasCustomFooterCurrency || !selectedCurrency) {
            return false;
        }
        return isReportsSearch
            ? areAllSelectedReportsConverted(selectedReportIDs, (reportID) => isReportFresh(reportID, selectedCurrency))
            : areAllSelectedEntriesConverted(
                  selectedTransactions,
                  (key) => isGroupFresh(key, selectedCurrency),
                  (transactionID) => isTransactionFresh(transactionID, selectedCurrency),
              );
    }, [hasCustomFooterCurrency, isGroupFresh, isReportFresh, isReportsSearch, isTransactionFresh, selectedCurrency, selectedReportIDs, selectedTransactions]);

    // While a custom currency is chosen but its converted figures haven't arrived (or have gone stale after an edit),
    // the footer keeps showing the default-currency total behind a skeleton until the cache catches up — but only when
    // there's something to convert, so a selection with nothing convertible stays on the default total rather than a
    // skeleton that never resolves.
    const isFooterTotalConverting = hasCustomFooterCurrency && (shouldUseClientTotal ? hasConvertibleSelection && !areAllSelectedConverted : !isSearchTotalFresh);

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

    // Fetch converted figures whenever a custom currency is chosen and the cache does not yet hold a fresh conversion
    // for what the footer needs. Each request stamps the source figures it converts, so the freshness checks keep this
    // to one request per out-of-coverage change (or per edit) rather than one per checkbox.
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
                    getFooterConvertedAmounts({
                        queryJSON: currentSearchQueryJSON,
                        targetCurrency: selectedCurrency,
                        reportIDList: selectedReportIDs.join(','),
                        sources: {reports: Object.fromEntries(selectedReportIDs.map((reportID) => [reportID, {[selectedCurrency]: reportSourceByID[reportID]}]))},
                    });
                }
                return;
            }
            // Selected whole groups: one grouped request (derived from the query's groupBy) returns every group's
            // converted total, so no ID list is sent.
            if (selectedGroupKeys.some((key) => !isGroupFresh(key, selectedCurrency))) {
                getFooterConvertedAmounts({
                    queryJSON: currentSearchQueryJSON,
                    targetCurrency: selectedCurrency,
                    sources: {groups: Object.fromEntries(selectedGroupKeys.map((key) => [key, {[selectedCurrency]: groupSourceByKey[key]}]))},
                });
            }
            // Individually-selected transactions convert by transaction ID (the loose rows in a grouped view, or the
            // whole selection on a flat search).
            if (selectedTransactionIDs.some((transactionID) => !isTransactionFresh(transactionID, selectedCurrency))) {
                getFooterConvertedAmounts({
                    queryJSON: currentSearchQueryJSON,
                    targetCurrency: selectedCurrency,
                    transactionIDList: selectedTransactionIDs.join(','),
                    sources: {transactions: Object.fromEntries(selectedTransactionIDs.map((transactionID) => [transactionID, {[selectedCurrency]: transactionSourceByID[transactionID]}]))},
                });
            }
            return;
        }

        // Nothing/everything selected: fetch the whole-search converted grand total (returned keyed by the search
        // hash — flat via the window total, reports via searchTotalsMetadata, grouped via the summed groups).
        if (!isSearchTotalFresh) {
            getFooterConvertedAmounts({
                queryJSON: currentSearchQueryJSON,
                targetCurrency: selectedCurrency,
                sources: metadataTotal !== undefined ? {searchTotals: {[currentSearchHash]: {[selectedCurrency]: metadataTotal}}} : undefined,
            });
        }
    }, [
        areAllSelectedConverted,
        currentSearchHash,
        currentSearchQueryJSON,
        groupSourceByKey,
        hasCustomFooterCurrency,
        isGroupFresh,
        isReportsSearch,
        isSearchTotalFresh,
        isTransactionFresh,
        metadataTotal,
        reportSourceByID,
        selectedCurrency,
        selectedGroupKeys,
        selectedReportIDs,
        selectedTransactionIDs,
        shouldUseClientTotal,
        transactionSourceByID,
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

        if (hasCustomFooterCurrency && isSearchTotalFresh && selectedCurrencyConvertedTotal) {
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
        isSearchTotalFresh,
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

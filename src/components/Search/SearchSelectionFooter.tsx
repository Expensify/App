import useActivePolicy from '@hooks/useActivePolicy';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';

import {getFooterConvertedAmounts} from '@libs/actions/Search';
import {isGroupEntry} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

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

const EMPTY_REPORT_IDS: string[] = [];
const EMPTY_SOURCES: Record<string, number> = {};

function getGroupCount(group: unknown): number {
    if (group && typeof group === 'object' && 'count' in group && typeof group.count === 'number') {
        return group.count;
    }

    return 0;
}

function getTransactionCount(transactionKeys: string[], transactions: SelectedTransactions, searchData: SearchResults['data'] | undefined): number {
    return transactionKeys.reduce((count, key) => {
        if (isGroupEntry(key)) {
            return count + getGroupCount(searchData?.[key]);
        }
        const item = transactions[key];
        if (item.action === CONST.SEARCH.ACTION_TYPES.VIEW && key === item.reportID) {
            return count;
        }
        return count + 1;
    }, 0);
}

// The live default-currency figure a row contributes to the footer total (also what the footer falls back to before a
// conversion arrives). The footer stamps each conversion against this value and compares it on every render, so an
// inline edit that moves it is detected and the cached conversion is fetched again.
// Sources are expense-signed (the negation of the displayed amount), so callers sum them with `total - source`.
function getEntrySource(entry: SelectedTransactionInfo): number {
    return entry.groupAmount ?? -(entry.displayAmount ?? Math.abs(entry.amount));
}

function getTransactionTotal(transactions: SelectedTransactionInfo[]): number {
    return transactions.reduce((total, transaction) => total - getEntrySource(transaction), 0);
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
    const {selectedTransactions, excludedTransactions = getEmptyObject<SelectedTransactions>(), areAllMatchingItemsSelected, selectedReports} = useSearchSelectionContext();
    const {currentSearchResults} = useSearchResultsContext();
    const {currentSearchHash, currentSearchKey, currentSearchQueryJSON} = useSearchQueryContext();
    const shouldAllowFooterTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true, areAllMatchingItemsSelected);
    const {isOffline} = useNetwork();
    const activePolicy = useActivePolicy();
    // The server converts search figures to the active policy's currency when the query carries no explicit target.
    const searchTargetCurrency = activePolicy?.outputCurrency ?? CONST.CURRENCY.USD;
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
    const failedConversionCurrencies = footerConversion?.failedCurrencies;

    // Source figures each conversion was stamped against. A conversion is "fresh" only while its stamped source
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
    const selectedTransactionsKeys = useMemo(() => Object.keys(selectedTransactions ?? {}), [selectedTransactions]);
    const excludedTransactionsKeys = useMemo(() => Object.keys(excludedTransactions), [excludedTransactions]);
    const isExpenseType = currentSearchQueryJSON?.type === CONST.SEARCH.DATA_TYPES.EXPENSE;
    const selectedExpenseCount = useMemo(
        () => getTransactionCount(selectedTransactionsKeys, selectedTransactions, currentSearchResults?.data),
        [currentSearchResults?.data, selectedTransactions, selectedTransactionsKeys],
    );
    const excludedExpenseCount = useMemo(
        () => (isExpenseType ? getTransactionCount(excludedTransactionsKeys, excludedTransactions, currentSearchResults?.data) : 0),
        [currentSearchResults?.data, excludedTransactions, excludedTransactionsKeys, isExpenseType],
    );

    // Individually-selected transactions (loose rows in a grouped view, or every row on a flat search).
    const selectedTransactionIDs = useMemo(
        () => selectedTransactionsKeys.map((key) => selectedTransactions[key]?.transaction?.transactionID).filter((transactionID): transactionID is string => !!transactionID),
        [selectedTransactions, selectedTransactionsKeys],
    );
    const excludedTransactionIDs = useMemo(
        () => excludedTransactionsKeys.map((key) => excludedTransactions[key]?.transaction?.transactionID).filter((transactionID): transactionID is string => !!transactionID),
        [excludedTransactions, excludedTransactionsKeys],
    );
    const selectedReportIDs = useMemo(() => {
        if (!isReportsSearch) {
            return EMPTY_REPORT_IDS;
        }
        return selectedReports.map((report) => report.reportID).filter((reportID): reportID is string => !!reportID);
    }, [isReportsSearch, selectedReports]);
    const selectedGroupKeys = useMemo(() => selectedTransactionsKeys.filter(isGroupEntry), [selectedTransactionsKeys]);
    const excludedGroupKeys = useMemo(() => excludedTransactionsKeys.filter(isGroupEntry), [excludedTransactionsKeys]);

    // Live default-currency source figures, keyed the same way as the conversion cache, captured from the current
    // selection/snapshot on every render. The freshness checks below compare these to the figures stamped when each
    // conversion was requested.
    const transactionSourceByID = useMemo(() => {
        const sources: Record<string, number> = {};
        for (const transactions of [selectedTransactions, excludedTransactions]) {
            for (const [key, transaction] of Object.entries(transactions)) {
                const transactionID = transaction.transaction?.transactionID;
                if (!isGroupEntry(key) && transactionID) {
                    sources[transactionID] = getEntrySource(transaction);
                }
            }
        }
        return sources;
    }, [excludedTransactions, selectedTransactions]);
    const groupSourceByKey = useMemo(() => {
        const sources: Record<string, number> = {};
        for (const transactions of [selectedTransactions, excludedTransactions]) {
            for (const [key, transaction] of Object.entries(transactions)) {
                if (isGroupEntry(key)) {
                    sources[key] = getEntrySource(transaction);
                }
            }
        }
        return sources;
    }, [excludedTransactions, selectedTransactions]);

    // Source figures for every loaded group, not just the selected ones. The grouped response caches every group's
    // converted value, so stamping them all lets a later selection of another group reuse the cache instead of
    // re-running the grouped query. Uses the same expense-signed figure as getEntrySource so a stamp always matches
    // the live source the freshness checks compare against.
    const loadedGroupSourceByKey = useMemo(() => {
        const data = currentSearchResults?.data;
        if (!isGroupedSearch || !data) {
            return EMPTY_SOURCES;
        }
        const sources: Record<string, number> = {};
        for (const key of Object.keys(data)) {
            if (!isGroupEntry(key)) {
                continue;
            }
            const group: unknown = data[key];
            if (group && typeof group === 'object' && 'total' in group && typeof group.total === 'number') {
                sources[key] = -Math.abs(group.total);
            }
        }
        return sources;
    }, [currentSearchResults?.data, isGroupedSearch]);
    const reportSourceByID = useMemo(() => {
        if (!isReportsSearch) {
            return EMPTY_SOURCES;
        }
        const sources: Record<string, number> = {};
        for (const report of selectedReports) {
            if (report.reportID) {
                sources[report.reportID] = report.total;
            }
        }
        return sources;
    }, [isReportsSearch, selectedReports]);

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

    // A conversion has been requested for the current live source when the stamp (written optimistically at request
    // time) matches it — the converted value may still be in flight. The fetch effect fires on this weaker predicate,
    // not on freshness: freshness also requires the value, so using it would fire a duplicate request when the
    // effect re-runs off its own optimistic stamp merge.
    const wasTransactionRequested = useCallback(
        (transactionID: string, currency: string) => conversionSources?.transactions?.[transactionID]?.[currency] === transactionSourceByID[transactionID],
        [conversionSources, transactionSourceByID],
    );
    const wasGroupRequested = useCallback((key: string, currency: string) => conversionSources?.groups?.[key]?.[currency] === groupSourceByKey[key], [conversionSources, groupSourceByKey]);
    const wasReportRequested = useCallback(
        (reportID: string, currency: string) => conversionSources?.reports?.[reportID]?.[currency] === reportSourceByID[reportID],
        [conversionSources, reportSourceByID],
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

    // The most recent conversion request for this currency failed, so stop waiting on a converted value that isn't coming.
    const hasConversionFailed = hasCustomFooterCurrency && !!selectedCurrency && !!failedConversionCurrencies?.[selectedCurrency];

    const selectedCurrencyConvertedTotal = hasCustomFooterCurrency && selectedCurrency ? convertedSearchTotal?.[selectedCurrency] : undefined;

    // The whole-search grand total is fresh only while its stamped source still equals the live snapshot total.
    const isSearchTotalFresh = !!selectedCurrencyConvertedTotal && !!selectedCurrency && conversionSources?.searchTotals?.[currentSearchHash]?.[selectedCurrency] === metadataTotal;
    const wasSearchTotalRequested = !!selectedCurrency && metadataTotal !== undefined && conversionSources?.searchTotals?.[currentSearchHash]?.[selectedCurrency] === metadataTotal;

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

    const hasExcludedExpenses = isExpenseType && excludedTransactionsKeys.length > 0;
    const areAllExcludedConverted = useMemo(() => {
        if (!hasCustomFooterCurrency || !selectedCurrency || !hasExcludedExpenses) {
            return false;
        }
        return areAllSelectedEntriesConverted(
            excludedTransactions,
            (key) => isGroupFresh(key, selectedCurrency),
            (transactionID) => isTransactionFresh(transactionID, selectedCurrency),
        );
    }, [excludedTransactions, hasCustomFooterCurrency, hasExcludedExpenses, isGroupFresh, isTransactionFresh, selectedCurrency]);

    // Show the loading skeleton only while a conversion can still arrive — there is something to convert, the request
    // can be made (online) and hasn't failed. Otherwise the footer stays on the default-currency total instead of a
    // skeleton that would never resolve.
    const isFooterTotalConverting =
        !isOffline &&
        !hasConversionFailed &&
        hasCustomFooterCurrency &&
        (shouldUseClientTotal ? hasConvertibleSelection && !areAllSelectedConverted : !isSearchTotalFresh || (hasExcludedExpenses && !areAllExcludedConverted));
    const shouldShowFooter = (!areAllMatchingItemsSelected && selectedTransactionsKeys.length > 0) || (shouldAllowFooterTotals && !!metadata?.count);

    // Fetch converted figures whenever a custom currency is chosen and no request has covered what the footer needs.
    // Each request stamps the source figures it converts, so the requested checks keep this to one request per
    // out-of-coverage change (or per edit) rather than one per checkbox or render.
    useEffect(() => {
        // No conversion can complete offline, so don't queue reads that can't resolve; the effect re-runs on reconnect.
        if (isOffline || !hasCustomFooterCurrency || !currentSearchQueryJSON || !selectedCurrency) {
            return;
        }

        if (shouldUseClientTotal) {
            if (areAllSelectedConverted) {
                return;
            }
            if (isReportsSearch) {
                // Request only the reports without a covering request: items already converted (or in flight) keep
                // their cached figures, so growing a selection converts just the delta.
                const reportIDsToConvert = selectedReportIDs.filter((reportID) => !wasReportRequested(reportID, selectedCurrency));
                if (reportIDsToConvert.length > 0) {
                    getFooterConvertedAmounts({
                        queryJSON: currentSearchQueryJSON,
                        searchKey: currentSearchKey,
                        targetCurrency: selectedCurrency,
                        reportIDList: reportIDsToConvert.join(','),
                        sources: {reports: Object.fromEntries(reportIDsToConvert.map((reportID) => [reportID, {[selectedCurrency]: reportSourceByID[reportID]}]))},
                    });
                }
                return;
            }

            // Selected whole groups: one grouped request (derived from the query's groupBy) returns every group's
            // converted total, so no ID list is sent. Stamp every loaded group (selected ones from their entries, so
            // the request always settles its own fire condition) — later selections of other groups then reuse the
            // cached response instead of re-running the grouped query.
            if (selectedGroupKeys.some((key) => !wasGroupRequested(key, selectedCurrency))) {
                const groupSources = {...loadedGroupSourceByKey, ...groupSourceByKey};
                getFooterConvertedAmounts({
                    queryJSON: currentSearchQueryJSON,
                    searchKey: currentSearchKey,
                    targetCurrency: selectedCurrency,
                    sources: {groups: Object.fromEntries(Object.entries(groupSources).map(([key, source]) => [key, {[selectedCurrency]: source}]))},
                });
            }

            // Individually-selected transactions convert by transaction ID (the loose rows in a grouped view, or the
            // whole selection on a flat search). Request only the ones without a covering request, so growing a
            // selection converts just the delta.
            const transactionIDsToConvert = selectedTransactionIDs.filter((transactionID) => !wasTransactionRequested(transactionID, selectedCurrency));
            if (transactionIDsToConvert.length > 0) {
                getFooterConvertedAmounts({
                    queryJSON: currentSearchQueryJSON,
                    searchKey: currentSearchKey,
                    targetCurrency: selectedCurrency,
                    transactionIDList: transactionIDsToConvert.join(','),
                    sources: {
                        transactions: Object.fromEntries(transactionIDsToConvert.map((transactionID) => [transactionID, {[selectedCurrency]: transactionSourceByID[transactionID]}])),
                    },
                });
            }
            return;
        }

        if (excludedGroupKeys.some((key) => !wasGroupRequested(key, selectedCurrency))) {
            const groupSources = {...loadedGroupSourceByKey, ...groupSourceByKey};
            getFooterConvertedAmounts({
                queryJSON: currentSearchQueryJSON,
                searchKey: currentSearchKey,
                targetCurrency: selectedCurrency,
                sources: {groups: Object.fromEntries(Object.entries(groupSources).map(([key, source]) => [key, {[selectedCurrency]: source}]))},
            });
        }

        const excludedTransactionIDsToConvert = excludedTransactionIDs.filter((transactionID) => !wasTransactionRequested(transactionID, selectedCurrency));
        if (excludedTransactionIDsToConvert.length > 0) {
            getFooterConvertedAmounts({
                queryJSON: currentSearchQueryJSON,
                searchKey: currentSearchKey,
                targetCurrency: selectedCurrency,
                transactionIDList: excludedTransactionIDsToConvert.join(','),
                sources: {
                    transactions: Object.fromEntries(excludedTransactionIDsToConvert.map((transactionID) => [transactionID, {[selectedCurrency]: transactionSourceByID[transactionID]}])),
                },
            });
        }

        // Nothing/everything selected: fetch the whole-search converted grand total (returned keyed by the search
        // hash — flat via the window total, reports via searchTotalsMetadata, grouped via the summed groups).
        if (!wasSearchTotalRequested) {
            getFooterConvertedAmounts({
                queryJSON: currentSearchQueryJSON,
                searchKey: currentSearchKey,
                targetCurrency: selectedCurrency,
                sources: metadataTotal !== undefined ? {searchTotals: {[currentSearchHash]: {[selectedCurrency]: metadataTotal}}} : undefined,
            });
        }
    }, [
        areAllSelectedConverted,
        currentSearchHash,
        currentSearchKey,
        currentSearchQueryJSON,
        excludedGroupKeys,
        excludedTransactionIDs,
        groupSourceByKey,
        hasCustomFooterCurrency,
        loadedGroupSourceByKey,
        wasGroupRequested,
        isOffline,
        wasReportRequested,
        isReportsSearch,
        wasSearchTotalRequested,
        wasTransactionRequested,
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
        (currency: string) => {
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
            const shouldUseConvertedSelectedTotal = hasCustomFooterCurrency && areAllSelectedConverted && !hasConversionFailed && !!selectedCurrency;

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
                    return acc - (convertedAmount ?? getEntrySource(transaction));
                }, 0);
            }

            return {count: selectedExpenseCount, total, currency: shouldUseConvertedSelectedTotal ? selectedCurrency : fallbackCurrency};
        }

        if (hasCustomFooterCurrency && isSearchTotalFresh && (!hasExcludedExpenses || areAllExcludedConverted) && !hasConversionFailed && selectedCurrencyConvertedTotal) {
            const excludedConvertedTotal = hasExcludedExpenses
                ? excludedTransactionsKeys.reduce((total, key) => {
                      const transaction = excludedTransactions[key];
                      const transactionID = transaction.transaction?.transactionID;
                      let convertedAmount;
                      if (isGroupEntry(key)) {
                          convertedAmount = convertedGroups?.[key]?.[selectedCurrency];
                      } else if (transactionID) {
                          convertedAmount = convertedTransactions?.[transactionID]?.[selectedCurrency];
                      }
                      return total - (convertedAmount ?? getEntrySource(transaction));
                  }, 0)
                : 0;
            return {
                count: Math.max(selectedCurrencyConvertedTotal.count - excludedExpenseCount, 0),
                total: selectedCurrencyConvertedTotal.total - excludedConvertedTotal,
                currency: selectedCurrency,
            };
        }

        const excludedTotal = hasExcludedExpenses ? getTransactionTotal(Object.values(excludedTransactions)) : 0;
        return {
            count: metadataCount === undefined ? undefined : Math.max(metadataCount - excludedExpenseCount, 0),
            total: metadataTotal === undefined ? undefined : metadataTotal - excludedTotal,
            currency: effectiveDefaultCurrency ?? metadataCurrency,
        };
    }, [
        areAllSelectedConverted,
        areAllExcludedConverted,
        convertedGroups,
        convertedReports,
        convertedTransactions,
        effectiveDefaultCurrency,
        excludedExpenseCount,
        excludedTransactions,
        excludedTransactionsKeys,
        hasConversionFailed,
        hasCustomFooterCurrency,
        hasExcludedExpenses,
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
            defaultCurrency={searchTargetCurrency}
            isTotalLoading={isFooterTotalLoading}
            onCurrencyChange={handleFooterCurrencyChange}
        />
    );
}

export default SearchSelectionFooter;

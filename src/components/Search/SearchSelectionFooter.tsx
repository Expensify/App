import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
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

const EMPTY_REPORT_IDS: string[] = [];
const EMPTY_SOURCES: Record<string, number> = {};

function getGroupCount(group: unknown): number {
    if (group && typeof group === 'object' && 'count' in group && typeof group.count === 'number') {
        return group.count;
    }

    return 0;
}

// The live default-currency figure a row contributes to the footer total (also what the footer falls back to before a
// conversion arrives). The footer stamps each conversion against this value and compares it on every render, so an
// inline edit that moves it is detected and the cached conversion is fetched again.
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
    const {isOffline} = useNetwork();
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const personalPolicy = usePolicy(personalPolicyID);
    // The Preferences > Payment currency setting. The server falls back to this same currency for search.currency,
    // so a default derived from it won't change once a snapshot arrives carrying server totals.
    const paymentCurrency = personalPolicy?.outputCurrency ?? CONST.CURRENCY.USD;
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
    const selectedReportIDs = useMemo(() => {
        if (!isReportsSearch) {
            return EMPTY_REPORT_IDS;
        }
        return selectedReports.map((report) => report.reportID).filter((reportID): reportID is string => !!reportID);
    }, [isReportsSearch, selectedReports]);
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
    // metadataCurrency is unset for a fresh no-workspace account until a search populates search.currency (e.g. after
    // visiting Reports), so fall back to the live payment currency instead of an arbitrary selected expense's currency.
    const effectiveDefaultCurrency = defaultFooterCurrency ?? metadataCurrency ?? paymentCurrency;

    // The currency the footer wants to display: an explicit picker choice, otherwise the default. Conversion is keyed
    // off this target rather than only picker choices because the default itself can move away from the loaded
    // figures — changing Preferences > Payment currency updates it live while the loaded rows stay denominated in
    // the currency the server converted to at fetch time.
    const conversionTargetCurrency = selectedCurrency ?? effectiveDefaultCurrency;

    // Whether some selected row's figure is denominated in a currency other than the target. Per-row figures come
    // from getEntrySource: the server-converted groupAmount (denominated in groupCurrency) or the raw amount
    // (denominated in the row's own currency). The Reports search sums report totals (denominated in each report's
    // currency) instead, and report-view rows are ignored, both mirroring areAllSelectedConverted below.
    const selectionNeedsConversion = useMemo(() => {
        if (isReportsSearch) {
            return selectedReports.some((report) => report.currency !== conversionTargetCurrency);
        }
        return selectedTransactionsKeys.some((key) => {
            const entry = selectedTransactions[key];
            if (!isGroupEntry(key) && entry.action === CONST.SEARCH.ACTION_TYPES.VIEW && key === entry.reportID) {
                return false;
            }
            return (entry.groupCurrency ?? entry.currency) !== conversionTargetCurrency;
        });
    }, [conversionTargetCurrency, isReportsSearch, selectedReports, selectedTransactions, selectedTransactionsKeys]);

    // The whole-search grand total is denominated in metadataCurrency (the server writes the two together), so it
    // only needs converting when that differs from the target.
    const needsSearchTotalConversion = !!metadataCurrency && metadataCurrency !== conversionTargetCurrency;

    const needsFooterConversion = shouldUseClientTotal ? selectionNeedsConversion : needsSearchTotalConversion;

    // The most recent conversion request for this currency failed, so stop waiting on a converted value that isn't coming.
    const hasConversionFailed = needsFooterConversion && !!failedConversionCurrencies?.[conversionTargetCurrency];

    const targetConvertedSearchTotal = needsFooterConversion ? convertedSearchTotal?.[conversionTargetCurrency] : undefined;

    // The whole-search grand total is fresh only while its stamped source still equals the live snapshot total.
    const isSearchTotalFresh = !!targetConvertedSearchTotal && conversionSources?.searchTotals?.[currentSearchHash]?.[conversionTargetCurrency] === metadataTotal;
    const wasSearchTotalRequested = metadataTotal !== undefined && conversionSources?.searchTotals?.[currentSearchHash]?.[conversionTargetCurrency] === metadataTotal;

    // Whether the selection has anything to convert per-row: reports on the Reports search, otherwise selected whole
    // groups and/or individual transactions.
    const hasConvertibleSelection = isReportsSearch ? selectedReportIDs.length > 0 : selectedGroupKeys.length > 0 || selectedTransactionIDs.length > 0;

    const areAllSelectedConverted = useMemo(() => {
        if (!needsFooterConversion) {
            return false;
        }
        return isReportsSearch
            ? areAllSelectedReportsConverted(selectedReportIDs, (reportID) => isReportFresh(reportID, conversionTargetCurrency))
            : areAllSelectedEntriesConverted(
                  selectedTransactions,
                  (key) => isGroupFresh(key, conversionTargetCurrency),
                  (transactionID) => isTransactionFresh(transactionID, conversionTargetCurrency),
              );
    }, [conversionTargetCurrency, isGroupFresh, isReportFresh, isReportsSearch, isTransactionFresh, needsFooterConversion, selectedReportIDs, selectedTransactions]);

    // Show the loading skeleton only while a conversion can still arrive — there is something to convert, the request
    // can be made (online) and hasn't failed. Otherwise the footer stays on the unconverted total instead of a
    // skeleton that would never resolve.
    const isFooterTotalConverting =
        !isOffline && !hasConversionFailed && needsFooterConversion && (shouldUseClientTotal ? hasConvertibleSelection && !areAllSelectedConverted : !isSearchTotalFresh);

    const shouldShowFooter = (!areAllMatchingItemsSelected && selectedTransactionsKeys.length > 0) || (shouldAllowFooterTotals && !!metadata?.count);

    // Fetch converted figures whenever the target currency isn't the one the loaded figures are denominated in and no
    // request has covered what the footer needs. Each request stamps the source figures it converts, so the requested
    // checks keep this to one request per out-of-coverage change (or per edit) rather than one per checkbox or render.
    useEffect(() => {
        // No conversion can complete offline, so don't queue reads that can't resolve; the effect re-runs on reconnect.
        if (isOffline || !needsFooterConversion || !currentSearchQueryJSON) {
            return;
        }

        if (shouldUseClientTotal) {
            if (areAllSelectedConverted) {
                return;
            }
            if (isReportsSearch) {
                // Request only the reports without a covering request: items already converted (or in flight) keep
                // their cached figures, so growing a selection converts just the delta.
                const reportIDsToConvert = selectedReportIDs.filter((reportID) => !wasReportRequested(reportID, conversionTargetCurrency));
                if (reportIDsToConvert.length > 0) {
                    getFooterConvertedAmounts({
                        queryJSON: currentSearchQueryJSON,
                        searchKey: currentSearchKey,
                        targetCurrency: conversionTargetCurrency,
                        reportIDList: reportIDsToConvert.join(','),
                        sources: {reports: Object.fromEntries(reportIDsToConvert.map((reportID) => [reportID, {[conversionTargetCurrency]: reportSourceByID[reportID]}]))},
                    });
                }
                return;
            }

            // Selected whole groups: one grouped request (derived from the query's groupBy) returns every group's
            // converted total, so no ID list is sent. Stamp every loaded group (selected ones from their entries, so
            // the request always settles its own fire condition) — later selections of other groups then reuse the
            // cached response instead of re-running the grouped query.
            if (selectedGroupKeys.some((key) => !wasGroupRequested(key, conversionTargetCurrency))) {
                const groupSources = {...loadedGroupSourceByKey, ...groupSourceByKey};
                getFooterConvertedAmounts({
                    queryJSON: currentSearchQueryJSON,
                    searchKey: currentSearchKey,
                    targetCurrency: conversionTargetCurrency,
                    sources: {groups: Object.fromEntries(Object.entries(groupSources).map(([key, source]) => [key, {[conversionTargetCurrency]: source}]))},
                });
            }

            // Individually-selected transactions convert by transaction ID (the loose rows in a grouped view, or the
            // whole selection on a flat search). Request only the ones without a covering request, so growing a
            // selection converts just the delta.
            const transactionIDsToConvert = selectedTransactionIDs.filter((transactionID) => !wasTransactionRequested(transactionID, conversionTargetCurrency));
            if (transactionIDsToConvert.length > 0) {
                getFooterConvertedAmounts({
                    queryJSON: currentSearchQueryJSON,
                    searchKey: currentSearchKey,
                    targetCurrency: conversionTargetCurrency,
                    transactionIDList: transactionIDsToConvert.join(','),
                    sources: {
                        transactions: Object.fromEntries(transactionIDsToConvert.map((transactionID) => [transactionID, {[conversionTargetCurrency]: transactionSourceByID[transactionID]}])),
                    },
                });
            }
            return;
        }

        // Nothing/everything selected: fetch the whole-search converted grand total (returned keyed by the search
        // hash — flat via the window total, reports via searchTotalsMetadata, grouped via the summed groups).
        if (!wasSearchTotalRequested) {
            getFooterConvertedAmounts({
                queryJSON: currentSearchQueryJSON,
                searchKey: currentSearchKey,
                targetCurrency: conversionTargetCurrency,
                sources: metadataTotal !== undefined ? {searchTotals: {[currentSearchHash]: {[conversionTargetCurrency]: metadataTotal}}} : undefined,
            });
        }
    }, [
        areAllSelectedConverted,
        conversionTargetCurrency,
        currentSearchHash,
        currentSearchKey,
        currentSearchQueryJSON,
        groupSourceByKey,
        loadedGroupSourceByKey,
        wasGroupRequested,
        isOffline,
        wasReportRequested,
        isReportsSearch,
        wasSearchTotalRequested,
        wasTransactionRequested,
        metadataTotal,
        needsFooterConversion,
        reportSourceByID,
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
        // Unconverted figures are denominated in groupCurrency (or the row's own currency), so label them with that
        // when they're shown as-is (offline, failed, or unconvertible selections) instead of the target's symbol.
        const fallbackCurrency = selectedTransactionItems.at(0)?.groupCurrency ?? selectedTransactionItems.at(0)?.currency ?? effectiveDefaultCurrency;

        if (shouldUseClientTotal) {
            const shouldUseConvertedSelectedTotal = needsFooterConversion && areAllSelectedConverted && !hasConversionFailed;

            // Reports sum each selected report's converted total; other searches sum per row — whole groups from the
            // groups cache, individual transactions from the transactions cache — falling back to the unconverted
            // per-row amount until the conversion is ready, which keeps the footer on that currency meanwhile.
            let total;
            if (shouldUseConvertedSelectedTotal && isReportsSearch) {
                total = selectedReportIDs.reduce((acc, reportID) => acc - (convertedReports?.[reportID]?.[conversionTargetCurrency] ?? 0), 0);
            } else {
                total = selectedTransactionsKeys.reduce((acc, key) => {
                    const transaction = selectedTransactions[key];
                    let convertedAmount;
                    if (shouldUseConvertedSelectedTotal) {
                        if (isGroupEntry(key)) {
                            convertedAmount = convertedGroups?.[key]?.[conversionTargetCurrency];
                        } else if (transaction.transaction?.transactionID) {
                            convertedAmount = convertedTransactions?.[transaction.transaction.transactionID]?.[conversionTargetCurrency];
                        }
                    }
                    return acc - (convertedAmount ?? transaction.groupAmount ?? -Math.abs(transaction.amount));
                }, 0);
            }

            return {count: selectedExpenseCount, total, currency: shouldUseConvertedSelectedTotal || !selectionNeedsConversion ? conversionTargetCurrency : fallbackCurrency};
        }

        if (needsFooterConversion && isSearchTotalFresh && !hasConversionFailed && targetConvertedSearchTotal) {
            return {count: targetConvertedSearchTotal.count, total: targetConvertedSearchTotal.total, currency: conversionTargetCurrency};
        }

        return {count: metadataCount, total: metadataTotal, currency: metadataCurrency ?? effectiveDefaultCurrency};
    }, [
        areAllSelectedConverted,
        conversionTargetCurrency,
        convertedGroups,
        convertedReports,
        convertedTransactions,
        effectiveDefaultCurrency,
        hasConversionFailed,
        isReportsSearch,
        isSearchTotalFresh,
        metadataCount,
        metadataCurrency,
        metadataTotal,
        needsFooterConversion,
        selectedExpenseCount,
        selectedReportIDs,
        selectedTransactions,
        selectedTransactionsKeys,
        selectionNeedsConversion,
        shouldAllowFooterTotals,
        shouldUseClientTotal,
        targetConvertedSearchTotal,
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
        />
    );
}

export default SearchSelectionFooter;

import React, {useCallback, useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import {search} from '@libs/actions/Search';
import {buildFlatQueryWithoutGroupBy} from '@libs/SearchQueryUtils';
import {isGroupEntry} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
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

    /** Hash of the auxiliary flat-query snapshot used for converted footer totals in grouped views */
    footerTotalHash: number | undefined;
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

function areAllSelectedExpensesInAuxiliarySnapshot(selectedTransactions: SelectedTransactions, footerTotalData: Record<string, unknown>): boolean {
    return Object.keys(selectedTransactions).every((key) => {
        const transaction = selectedTransactions[key];
        if (transaction.action === CONST.SEARCH.ACTION_TYPES.VIEW && key === transaction.reportID) {
            return true;
        }

        const convertedTransactionKey = transaction.transaction?.transactionID ? `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transaction.transactionID}` : key;
        const convertedTransaction = footerTotalData[convertedTransactionKey];
        return getNumberMember(convertedTransaction, 'groupAmount') !== undefined;
    });
}

function shouldAllowFooterCurrencyChange(
    hasSelectedGroup: boolean,
    hasPartialSelection: boolean,
    areAllSelectedForFooter: boolean,
    hasCustomFooterCurrency: boolean,
    footerTotalData: Record<string, unknown> | undefined,
    isFooterTotalConverting: boolean,
    selectedTransactions: SelectedTransactions,
): boolean {
    if (hasSelectedGroup) {
        return false;
    }

    if (!hasPartialSelection || areAllSelectedForFooter) {
        return true;
    }

    if (isFooterTotalConverting) {
        return true;
    }

    if (hasCustomFooterCurrency && footerTotalData) {
        return areAllSelectedExpensesInAuxiliarySnapshot(selectedTransactions, footerTotalData);
    }

    return true;
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
    const areAllSelectedForFooter = areAllMatchingItemsSelected || (selectedTransactionsKeys.length > 0 && metadataCount !== undefined && selectedExpenseCount === metadataCount);
    const hasPartialSelection = selectedTransactionsKeys.length > 0 && !areAllSelectedForFooter;
    const firstSelectedTransactionKey = selectedTransactionsKeys.at(0);
    const firstSelectedTransaction = firstSelectedTransactionKey ? selectedTransactions[firstSelectedTransactionKey] : undefined;
    const selectedTransactionDefaultCurrency = firstSelectedTransaction?.groupCurrency ?? firstSelectedTransaction?.currency;
    const effectiveDefaultCurrency = defaultFooterCurrency ?? metadataCurrency ?? selectedTransactionDefaultCurrency;
    const hasCustomFooterCurrency = !!selectedCurrency && selectedCurrency !== effectiveDefaultCurrency;
    const isFooterTotalConverting = hasCustomFooterCurrency && !!footerTotalMetadata?.isLoading;
    const footerTotalDataRecord = footerTotalData as Record<string, unknown> | undefined;
    const areAllSelectedInAuxiliarySnapshot = useMemo(
        () => !!footerTotalDataRecord && areAllSelectedExpensesInAuxiliarySnapshot(selectedTransactions, footerTotalDataRecord),
        [footerTotalDataRecord, selectedTransactions],
    );
    const shouldShowFooter = (!areAllMatchingItemsSelected && selectedTransactionsKeys.length > 0) || (shouldAllowFooterTotals && !!metadata?.count);
    const wasMetadataLoading = usePrevious(isMetadataLoading);

    const shouldResetCustomCurrencyAfterLiveRefresh =
        !!selectedCurrency && selectedCurrency !== effectiveDefaultCurrency && !!wasMetadataLoading && !isMetadataLoading && metadata?.offset === 0;
    const shouldResetCustomCurrencyForGroupSelection = hasSelectedGroup && !!selectedCurrency;
    const shouldResetCustomCurrencyForUncoveredSelection =
        hasPartialSelection && !!selectedCurrency && !!footerTotalDataRecord && !isFooterTotalConverting && !areAllSelectedInAuxiliarySnapshot;
    if (shouldResetCustomCurrencyAfterLiveRefresh || shouldResetCustomCurrencyForGroupSelection || shouldResetCustomCurrencyForUncoveredSelection) {
        setFooterCurrencyState({
            searchHash: currentSearchHash,
            selectedCurrency: undefined,
            defaultCurrency: effectiveDefaultCurrency,
            footerTotalHash: undefined,
        });
    }

    const handleFooterCurrencyChange = useCallback(
        (currency: string | undefined) => {
            const nextCurrency = currency ?? effectiveDefaultCurrency;
            if (!currentSearchQueryJSON || !nextCurrency) {
                return;
            }

            const isResettingToDefault = nextCurrency === effectiveDefaultCurrency;

            // Fetch converted footer totals in a currency-scoped snapshot so the live search snapshot stays in its original currency.
            const flatQueryJSON = !isResettingToDefault ? buildFlatQueryWithoutGroupBy(currentSearchQueryJSON, nextCurrency) : undefined;

            setFooterCurrencyState({
                searchHash: currentSearchHash,
                selectedCurrency: currency,
                defaultCurrency: effectiveDefaultCurrency,
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
        [currentSearchHash, currentSearchQueryJSON, effectiveDefaultCurrency],
    );

    const footerData = useMemo(() => {
        if (!shouldAllowFooterTotals && selectedTransactionsKeys.length === 0) {
            return {count: undefined, total: undefined, currency: undefined, isLoading: false};
        }

        const selectedTransactionItems = Object.values(selectedTransactions);
        const shouldUseClientTotal = !metadataCount || (selectedTransactionsKeys.length > 0 && !areAllSelectedForFooter);
        const defaultCurrency = effectiveDefaultCurrency;
        const isServerTotalConfirmed = !hasCustomFooterCurrency || footerTotalMetadata?.currency === selectedCurrency;
        const canConvertSelectedTotal = shouldUseClientTotal && hasCustomFooterCurrency && footerTotalMetadata?.currency === selectedCurrency;

        // The auxiliary snapshot only covers its first page, so a selected row missing from that snapshot may have no
        // converted amount. Only label the selected total as the target currency when every selected row is present in
        // the auxiliary snapshot; otherwise fall back to the default-currency client total instead.
        const areAllSelectedRowsConvertedForTotal = canConvertSelectedTotal && areAllSelectedInAuxiliarySnapshot;
        const shouldUseConvertedSelectedTotal = canConvertSelectedTotal && areAllSelectedRowsConvertedForTotal;
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
                const convertedTransaction = shouldUseConvertedSelectedTotal ? getObjectMember(footerTotalData, convertedTransactionKey) : undefined;
                return acc - (getNumberMember(convertedTransaction, 'groupAmount') ?? transaction.groupAmount ?? -Math.abs(transaction.amount));
            }, 0);
        } else if (hasCustomFooterCurrency) {
            total = isServerTotalConfirmed ? footerTotalMetadata?.total : metadataTotal;
        } else {
            total = metadataTotal;
        }

        return {count, total, currency, isLoading: isFooterTotalConverting};
    }, [
        areAllSelectedForFooter,
        areAllSelectedInAuxiliarySnapshot,
        effectiveDefaultCurrency,
        footerTotalData,
        footerTotalMetadata?.currency,
        footerTotalMetadata?.total,
        hasCustomFooterCurrency,
        isFooterTotalConverting,
        metadataCount,
        metadataCurrency,
        metadataTotal,
        selectedCurrency,
        selectedExpenseCount,
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
            defaultCurrency={effectiveDefaultCurrency}
            isTotalLoading={isFooterTotalLoading}
            onCurrencyChange={handleFooterCurrencyChange}
            shouldAllowCurrencyChange={shouldAllowFooterCurrencyChange(
                hasSelectedGroup,
                hasPartialSelection,
                areAllSelectedForFooter,
                hasCustomFooterCurrency,
                footerTotalDataRecord,
                isFooterTotalConverting,
                selectedTransactions,
            )}
        />
    );
}

export default SearchSelectionFooter;

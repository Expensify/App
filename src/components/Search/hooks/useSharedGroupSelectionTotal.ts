/**
 * The count and total of a selection of groups that can share an expense, as violation groups do. Adding up the
 * groups would count a shared expense once per group, so the server is asked for the groups' union instead. The
 * footer and the selection bar both read it, and share one record of the requests in flight.
 */
import {getClaimedGroupKeys} from '@components/Search/selectionBuilders';
import type {SearchQueryJSON, SelectedTransactionInfo, SelectedTransactions} from '@components/Search/types';

import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {getGroupKeysSelectedViaGroup, getTemplateGroupExportQuery} from '@hooks/useSearchBulkActions';

import {getFooterConvertedAmounts} from '@libs/actions/Search';
import type {SearchKey} from '@libs/SearchKeyUtils';
import {canGroupsShareExpenses, isGroupEntry} from '@libs/SearchUIUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';

import {useEffect} from 'react';

type SharedGroupSelection = {
    /** Every expense in the selected groups, which the server counts and sums once each however many of the groups it sits in */
    unionQueryJSON: SearchQueryJSON;

    /** The selected groups' totals added up. The union's figures are stamped against it, so a change to any of the groups asks again */
    groupsTotal: number;

    /** Rows checked one by one that no selected group covers, which are added to the union's figures */
    looseEntries: SelectedTransactionInfo[];

    /** The currency the selected groups are summed in, which the union is asked in when the caller has none */
    currency: string | undefined;
};

type SharedGroupSelectionTotal = {
    /** The union's count and total in the currency asked for, once the server has answered for the current groups */
    total: {count: number; total: number} | undefined;

    /** The union's count, read from an answer in any currency, since the count is the same in all of them */
    count: number | undefined;

    /** Whether the answer can still arrive, which is not the case offline, without a currency to ask in, or once the request failed */
    isLoading: boolean;
};

/** Requests sent whose stamp has not reached Onyx yet, keyed by query hash and currency. Shared, so the footer and the selection bar never send the same one twice. */
const pendingGroupsTotalByRequestKey = new Map<string, number>();

/** Test-only: forgets the requests in flight between tests. */
function resetPendingSharedGroupRequestsForTesting() {
    pendingGroupsTotalByRequestKey.clear();
}

/**
 * The selection's groups and loose rows, where groups can share an expense. Undefined for any other grouping, under
 * Select all (whose figures are the search's own), when no group is selected as a whole, or when the groups can't be
 * turned into one query.
 */
function getSharedGroupSelection(
    queryJSON: SearchQueryJSON | undefined,
    selectedTransactions: SelectedTransactions,
    searchData: SearchResultDataType | undefined,
    areAllMatchingItemsSelected: boolean,
): SharedGroupSelection | undefined {
    if (!queryJSON || !searchData || areAllMatchingItemsSelected || !canGroupsShareExpenses(queryJSON.groupBy)) {
        return undefined;
    }
    const groupKeys = getGroupKeysSelectedViaGroup(selectedTransactions);
    const unionQueryJSON = groupKeys.length > 0 ? getTemplateGroupExportQuery(queryJSON, selectedTransactions, searchData) : undefined;
    if (!unionQueryJSON) {
        return undefined;
    }
    let groupsTotal = 0;
    let currency: string | undefined;
    for (const groupKey of groupKeys) {
        const group: unknown = searchData[groupKey];
        if (!group || typeof group !== 'object') {
            continue;
        }
        if ('total' in group && typeof group.total === 'number') {
            groupsTotal += group.total;
        }
        if (!currency && 'currency' in group && typeof group.currency === 'string') {
            currency = group.currency;
        }
    }
    const looseEntries = Object.entries(selectedTransactions)
        .filter(([key, transaction]) => !isGroupEntry(key) && getClaimedGroupKeys(transaction).length === 0)
        .map(([, transaction]) => transaction);
    return {unionQueryJSON, groupsTotal, looseEntries, currency};
}

/**
 * Asks for the union's figures once per set of groups and group totals, and returns them once answered. `currency` is
 * the one the total has to be in, falling back to the groups' own. A caller that only needs the count passes
 * `isCountOnly`, which reads an answer in any currency and asks only when no currency has been asked for yet.
 */
function useSharedGroupSelectionTotal(
    sharedGroupSelection: SharedGroupSelection | undefined,
    currency: string | undefined,
    searchKey: SearchKey | undefined,
    isCountOnly = false,
): SharedGroupSelectionTotal {
    const {isOffline} = useNetwork();
    const hash = sharedGroupSelection?.unionQueryJSON.hash;
    const requestCurrency = currency ?? sharedGroupSelection?.currency;
    const groupsTotal = sharedGroupSelection?.groupsTotal;
    const [answer] = useOnyx(ONYXKEYS.SEARCH_FOOTER_CONVERSION, {
        selector: (conversion) =>
            hash === undefined
                ? undefined
                : {
                      totals: conversion?.searchTotals?.[hash],
                      sources: conversion?.sources?.searchTotals?.[hash],
                      failedCurrencies: conversion?.failedCurrencies,
                  },
    });
    // The currencies whose request was stamped against the groups as they are now, so their answers describe these groups
    const stampedCurrencies = groupsTotal === undefined ? [] : Object.keys(answer?.sources ?? {}).filter((stampedCurrency) => answer?.sources?.[stampedCurrency] === groupsTotal);
    const isRequestCurrencyStamped = !!requestCurrency && stampedCurrencies.includes(requestCurrency);
    const total = isRequestCurrencyStamped && requestCurrency ? answer?.totals?.[requestCurrency] : undefined;
    const count = total?.count ?? stampedCurrencies.map((stampedCurrency) => answer?.totals?.[stampedCurrency]?.count).find((stampedCount) => stampedCount !== undefined);
    const wasRequested = isCountOnly ? stampedCurrencies.length > 0 : isRequestCurrencyStamped;
    const awaitedCurrencies = isCountOnly && stampedCurrencies.length > 0 ? stampedCurrencies : [requestCurrency];
    const hasFailed = awaitedCurrencies.every((awaitedCurrency) => !!awaitedCurrency && !!answer?.failedCurrencies?.[awaitedCurrency]);

    useEffect(() => {
        if (isOffline || !sharedGroupSelection || hash === undefined || !requestCurrency) {
            return;
        }
        // The pending mark only covers the gap until the request's stamp reaches Onyx. Once it has, the stamp answers, so
        // the mark is dropped: Search clears the cached figures when it is left, and the union has to be asked for again after that.
        if (wasRequested) {
            for (const stampedCurrency of stampedCurrencies) {
                pendingGroupsTotalByRequestKey.delete(`${hash}_${stampedCurrency}`);
            }
            return;
        }
        const requestKey = `${hash}_${requestCurrency}`;
        const isPending = isCountOnly
            ? [...pendingGroupsTotalByRequestKey].some(([pendingKey, pendingGroupsTotal]) => pendingKey.startsWith(`${hash}_`) && pendingGroupsTotal === sharedGroupSelection.groupsTotal)
            : pendingGroupsTotalByRequestKey.get(requestKey) === sharedGroupSelection.groupsTotal;
        if (isPending) {
            return;
        }
        pendingGroupsTotalByRequestKey.set(requestKey, sharedGroupSelection.groupsTotal);
        getFooterConvertedAmounts({
            queryJSON: sharedGroupSelection.unionQueryJSON,
            searchKey,
            targetCurrency: requestCurrency,
            sources: {searchTotals: {[hash]: {[requestCurrency]: sharedGroupSelection.groupsTotal}}},
        });
    }, [hash, isCountOnly, isOffline, requestCurrency, searchKey, sharedGroupSelection, stampedCurrencies, wasRequested]);

    const isAnswered = isCountOnly ? count !== undefined : !!total;
    return {total, count, isLoading: !!sharedGroupSelection && !isAnswered && !isOffline && !!requestCurrency && !hasFailed};
}

export default useSharedGroupSelectionTotal;
export {getSharedGroupSelection, resetPendingSharedGroupRequestsForTesting};
export type {SharedGroupSelection};

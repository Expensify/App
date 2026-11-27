/**
 * The count and total of a selection of groups that can share an expense, as violation groups do. Adding up the groups
 * would count a shared expense once per group, so the server is asked for the groups' union instead. The footer and the
 * selection bar both show it, so the request is made once here, above both, and each reads the answer.
 */
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {getGroupKeysSelectedViaGroup, getTemplateGroupExportQuery} from '@hooks/useSearchBulkActions';

import {getFooterConvertedAmounts} from '@libs/actions/Search';
import {buildSearchQueryJSON, getFooterSelectionFromQuery, getQueryWithFooterSelection} from '@libs/SearchQueryUtils';
import {canGroupsShareExpenses, isGroupEntry} from '@libs/SearchUIUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React, {createContext, useContext, useEffect, useRef} from 'react';

import type {SearchQueryJSON, SelectedTransactionInfo, SelectedTransactions} from './types';

import {useSearchQueryContext, useSearchResultsContext, useSearchSelectionContext} from './SearchContext';
import {getClaimedGroupKeys, getSearchGroupCountByKey} from './selectionBuilders';

type SharedGroupSelection = {
    /** Every expense in the selected groups, which the server counts and sums once each however many of the groups it sits in */
    unionQueryJSON: SearchQueryJSON;

    /** The selected groups' totals added up. The union's figures are stamped against it, so a change to any of the groups asks again */
    groupsTotal: number;

    /** Each selected group's expense count, as `groupKey:count` pairs. The union is stamped against it too, so a group gaining or losing an expense asks again even when its total stays the same */
    groupsCounts: string;

    /** Rows checked one by one that no selected group covers, which are added to the union's figures */
    looseEntries: SelectedTransactionInfo[];

    /** The currency the selected groups are summed in, which the union is asked in when the search names none */
    currency: string | undefined;
};

type SharedGroupSelectionTotal = {
    /** The selected groups and loose rows, or undefined when the selection needs no union */
    sharedGroupSelection: SharedGroupSelection | undefined;

    /** The union's count and total, once the server has answered for the current groups */
    total: {count: number; total: number} | undefined;

    /** The currency the union was asked in */
    currency: string | undefined;

    /** Whether the answer can still arrive, which is not the case offline, without a currency to ask in, or once the request failed */
    isLoading: boolean;
};

const SharedGroupSelectionTotalContext = createContext<SharedGroupSelectionTotal>({
    sharedGroupSelection: undefined,
    total: undefined,
    currency: undefined,
    isLoading: false,
});

/**
 * The selection's groups and loose rows, where groups can share an expense. Undefined for any other grouping, under
 * Select all (whose figures are the search's own), when fewer than two groups are selected as a whole (one group
 * can't count an expense twice, so its own figures are exact and need no request), or when the groups can't be
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
    const groupsQueryJSON = groupKeys.length > 1 ? getTemplateGroupExportQuery(queryJSON, selectedTransactions, searchData) : undefined;
    // The footer shows a group selection as the plain total with no breakdown, so the union has to be asked for the
    // plain total too. The query's footer selections would otherwise make the server return only that breakdown.
    const unionQueryJSON = groupsQueryJSON
        ? buildSearchQueryJSON(getQueryWithFooterSelection(groupsQueryJSON, {footerCount: undefined, footerTotal: undefined, footerCurrency: undefined}))
        : undefined;
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
    // Sorted, since the groups are listed in the order they were checked, which says nothing about what they hold
    const groupsCounts = groupKeys
        .map((groupKey) => `${groupKey}:${getSearchGroupCountByKey(searchData, groupKey) ?? ''}`)
        .sort()
        .join(',');
    const looseEntries = Object.entries(selectedTransactions)
        .filter(([key, transaction]) => !isGroupEntry(key) && getClaimedGroupKeys(transaction).length === 0)
        .map(([, transaction]) => transaction);
    return {unionQueryJSON, groupsTotal, groupsCounts, looseEntries, currency};
}

/**
 * Asks for the union of the selected groups once per set of groups, group totals and group counts. It is asked in the currency the
 * footer shows: the footer writes a picked currency into the query, and otherwise shows the search's own currency.
 */
function SharedGroupSelectionTotalProvider({children}: ChildrenProps) {
    const {selectedTransactions, areAllMatchingItemsSelected} = useSearchSelectionContext();
    const {currentSearchResults} = useSearchResultsContext();
    const {currentSearchKey, currentSearchQueryJSON} = useSearchQueryContext();
    const {isOffline} = useNetwork();
    // Requests sent whose stamp has not reached Onyx yet, keyed by query hash and currency. Onyx writes the stamp a moment
    // after the request goes out, so a render in that gap would otherwise send the same request again.
    const pendingGroupsStampByRequestKey = useRef(new Map<string, string>());

    const sharedGroupSelection = getSharedGroupSelection(currentSearchQueryJSON, selectedTransactions, currentSearchResults?.data, areAllMatchingItemsSelected);
    const hash = sharedGroupSelection?.unionQueryJSON.hash;
    const groupsTotal = sharedGroupSelection?.groupsTotal;
    const groupsCounts = sharedGroupSelection?.groupsCounts;
    const currency = getFooterSelectionFromQuery(currentSearchQueryJSON).footerCurrency ?? currentSearchResults?.search?.currency ?? sharedGroupSelection?.currency;
    const [answer] = useOnyx(ONYXKEYS.SEARCH_FOOTER_CONVERSION, {
        selector: (conversion) =>
            hash === undefined || !currency
                ? undefined
                : {
                      total: conversion?.searchTotals?.[hash]?.[currency],
                      source: conversion?.sources?.searchTotals?.[hash]?.[currency],
                      countsSource: conversion?.sources?.searchGroupCounts?.[hash]?.[currency],
                      hasFailed: !!conversion?.failedCurrencies?.[currency],
                  },
    });
    // The answer describes the groups as they are now only while it was stamped against their current totals and counts
    const wasRequested = groupsTotal !== undefined && answer?.source === groupsTotal && answer?.countsSource === groupsCounts;
    const total = wasRequested ? (answer?.total ?? undefined) : undefined;

    useEffect(() => {
        if (isOffline || !sharedGroupSelection || hash === undefined || !currency) {
            return;
        }
        const requestKey = `${hash}_${currency}`;
        // The pending mark only covers the gap until the request's stamp reaches Onyx. Once it has, the stamp answers, so
        // the mark is dropped: Search clears the cached figures when it is left, and the union has to be asked for again after that.
        if (wasRequested) {
            pendingGroupsStampByRequestKey.current.delete(requestKey);
            return;
        }
        const groupsStamp = `${sharedGroupSelection.groupsTotal}_${sharedGroupSelection.groupsCounts}`;
        if (pendingGroupsStampByRequestKey.current.get(requestKey) === groupsStamp) {
            return;
        }
        pendingGroupsStampByRequestKey.current.set(requestKey, groupsStamp);
        getFooterConvertedAmounts({
            queryJSON: sharedGroupSelection.unionQueryJSON,
            searchKey: currentSearchKey,
            targetCurrency: currency,
            sources: {
                searchTotals: {[hash]: {[currency]: sharedGroupSelection.groupsTotal}},
                searchGroupCounts: {[hash]: {[currency]: sharedGroupSelection.groupsCounts}},
            },
        });
    }, [currency, currentSearchKey, hash, isOffline, sharedGroupSelection, wasRequested]);

    const value = {
        sharedGroupSelection,
        total,
        currency,
        isLoading: !!sharedGroupSelection && !total && !isOffline && !!currency && !answer?.hasFailed,
    };
    return <SharedGroupSelectionTotalContext.Provider value={value}>{children}</SharedGroupSelectionTotalContext.Provider>;
}

/** The union of the selected groups that share expenses, read from the provider above the footer and the selection bar. */
function useSharedGroupSelectionTotal(): SharedGroupSelectionTotal {
    return useContext(SharedGroupSelectionTotalContext);
}

export default SharedGroupSelectionTotalProvider;
export {useSharedGroupSelectionTotal};

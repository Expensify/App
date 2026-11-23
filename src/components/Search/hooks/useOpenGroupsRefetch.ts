/** Fetches a grouped Search's open groups again when an expense is created in one or the user comes back to the screen. */
import type {SearchListItem, TransactionGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchGroupBy, SearchQueryJSON} from '@components/Search/types';

import {hasInFlightSearch, search, waitForInFlightSearch} from '@libs/actions/Search';
import {isTransactionGroupListItemType, isTransactionMatchWithGroupItem} from '@libs/SearchUIUtils';

import type {Transaction} from '@src/types/onyx';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef} from 'react';

type OpenGroup = TransactionGroupListItemType & {transactionsQueryJSON: SearchQueryJSON};

type UseOpenGroupsRefetchParams = {
    data: SearchListItem[];

    /** Keys of the groups the user has opened */
    expandedGroups: Set<string>;

    /** Expenses that were just created, set only on the render they show up in */
    newTransactions: Transaction[];

    groupBy: SearchGroupBy | undefined;
};

function getOpenGroups(data: SearchListItem[], expandedGroups: Set<string>): OpenGroup[] {
    if (expandedGroups.size === 0) {
        return [];
    }
    // A group without a search of its own, such as an expense report, has nothing to fetch.
    return data.filter((item): item is OpenGroup => isTransactionGroupListItemType(item) && !!item.keyForList && expandedGroups.has(item.keyForList) && !!item.transactionsQueryJSON);
}

/** Fetches the first page of a group's expenses, for when it opens and whenever the list refreshes it after that */
function fetchGroupFirstPage(queryJSON: SearchQueryJSON) {
    // Fetching the first page while a "show more" page is loading would reset the group's offset under it.
    if (hasInFlightSearch(queryJSON.hash)) {
        return;
    }
    search({queryJSON, searchKey: undefined, offset: 0, shouldCalculateTotals: false, isLoading: false});
}

function useOpenGroupsRefetch({data, expandedGroups, newTransactions, groupBy}: UseOpenGroupsRefetchParams) {
    const isScreenFocused = useIsFocused();
    const isMountedRef = useRef(true);
    const groupsWaitingToRefetchRef = useRef(new Set<number>());

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // The RHP can close before the new expense is written, so coming back to the screen fetches the group without it.
    // Skipping because that search is running would leave the expense out, so fetch again once the search finishes.
    const refetchGroupWithNewTransaction = (queryJSON: SearchQueryJSON) => {
        const {hash} = queryJSON;
        if (!hasInFlightSearch(hash)) {
            fetchGroupFirstPage(queryJSON);
            return;
        }
        if (groupsWaitingToRefetchRef.current.has(hash)) {
            return;
        }
        groupsWaitingToRefetchRef.current.add(hash);
        waitForInFlightSearch(hash).then(() => {
            groupsWaitingToRefetchRef.current.delete(hash);
            if (!isMountedRef.current) {
                return;
            }
            refetchGroupWithNewTransaction(queryJSON);
        });
    };

    const refetchOpenGroupsWithNewTransactions = useEffectEvent(() => {
        for (const group of getOpenGroups(data, expandedGroups)) {
            if (newTransactions.some((transaction) => isTransactionMatchWithGroupItem(transaction, group, groupBy))) {
                refetchGroupWithNewTransaction(group.transactionsQueryJSON);
            }
        }
    });

    const refetchAllOpenGroups = useEffectEvent(() => {
        for (const group of getOpenGroups(data, expandedGroups)) {
            fetchGroupFirstPage(group.transactionsQueryJSON);
        }
    });

    // Search can hand over a new array with the same expenses when it renders again, so fetch once per set of created expenses.
    const newTransactionIDs = newTransactions.map((transaction) => transaction.transactionID).join(',');
    useEffect(() => {
        if (!newTransactionIDs) {
            return;
        }
        refetchOpenGroupsWithNewTransactions();
    }, [newTransactionIDs]);

    // Keep open groups in sync with the grouped totals after returning from RHP flows.
    const wasScreenFocusedRef = useRef(isScreenFocused);
    useEffect(() => {
        const didReturnToScreen = !wasScreenFocusedRef.current && isScreenFocused;
        wasScreenFocusedRef.current = isScreenFocused;
        if (!didReturnToScreen) {
            return;
        }
        refetchAllOpenGroups();
    }, [isScreenFocused]);
}

export default useOpenGroupsRefetch;
export {fetchGroupFirstPage};

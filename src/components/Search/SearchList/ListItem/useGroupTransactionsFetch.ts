/**
 * Keeps an open Search group's expenses up to date after it has opened: fetches them again when an expense is created in
 * it, and when the user comes back to the screen. The list fetches them when it opens the group.
 */
import type {SearchQueryJSON} from '@components/Search/types';

import {search} from '@libs/actions/Search';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef} from 'react';

type UseGroupTransactionsFetchParams = {
    /** Undefined for a group with nothing to fetch, such as an expense report or a violation group */
    transactionsQueryJSON: SearchQueryJSON | undefined;

    /** Whether the group's own search is already running */
    isLoading: boolean;

    isExpanded: boolean;

    /** An expense just created in this group, if there is one */
    newTransactionID: string | undefined;
};

function useGroupTransactionsFetch({transactionsQueryJSON, isLoading, isExpanded, newTransactionID}: UseGroupTransactionsFetchParams) {
    const isScreenFocused = useIsFocused();

    const refetchFirstPageIfOpen = useEffectEvent(() => {
        if (!isExpanded || !transactionsQueryJSON) {
            return;
        }
        search({
            queryJSON: transactionsQueryJSON,
            searchKey: undefined,
            offset: 0,
            shouldCalculateTotals: false,
            isLoading,
        });
    });

    // Refetch so an expense created in an open group shows up in it. The list reuses rows as it scrolls, so a new ID that
    // came with a different group is that group's, not a new expense in the one this row was showing.
    const hash = transactionsQueryJSON?.hash;
    const lastNewTransactionRef = useRef({hash, newTransactionID});
    useEffect(() => {
        const last = lastNewTransactionRef.current;
        lastNewTransactionRef.current = {hash, newTransactionID};
        if (!newTransactionID || newTransactionID === last.newTransactionID || hash !== last.hash) {
            return;
        }
        refetchFirstPageIfOpen();
    }, [hash, newTransactionID]);

    // Keep an open group in sync with the grouped totals after returning from RHP flows.
    const wasScreenFocusedRef = useRef(isScreenFocused);
    useEffect(() => {
        const didReturnToScreen = !wasScreenFocusedRef.current && isScreenFocused;
        wasScreenFocusedRef.current = isScreenFocused;
        if (!didReturnToScreen) {
            return;
        }
        refetchFirstPageIfOpen();
    }, [isScreenFocused]);
}

export default useGroupTransactionsFetch;

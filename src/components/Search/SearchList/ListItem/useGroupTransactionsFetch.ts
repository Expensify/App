/**
 * Keeps an open Search group's expenses up to date: fetches them when the group opens, when an expense is created in it,
 * and when the user comes back to the screen.
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

    const fetchFirstPage = useEffectEvent(() => {
        if (!transactionsQueryJSON) {
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

    // The hash is a dependency because the list can reuse this row for another group that is already open.
    useEffect(() => {
        if (!isExpanded) {
            return;
        }
        fetchFirstPage();
    }, [isExpanded, transactionsQueryJSON?.hash]);

    // Opening the group is already handled above, so the fetches below must not run again when it opens.
    const fetchFirstPageIfOpen = useEffectEvent(() => {
        if (!isExpanded) {
            return;
        }
        fetchFirstPage();
    });

    // Refetch so an expense created in an open group shows up in it.
    useEffect(() => {
        if (!newTransactionID) {
            return;
        }
        fetchFirstPageIfOpen();
    }, [newTransactionID]);

    // Keep an open group in sync with the grouped totals after returning from RHP flows.
    const wasScreenFocusedRef = useRef(isScreenFocused);
    useEffect(() => {
        const didReturnToScreen = !wasScreenFocusedRef.current && isScreenFocused;
        wasScreenFocusedRef.current = isScreenFocused;
        if (!didReturnToScreen) {
            return;
        }
        fetchFirstPageIfOpen();
    }, [isScreenFocused]);
}

export default useGroupTransactionsFetch;

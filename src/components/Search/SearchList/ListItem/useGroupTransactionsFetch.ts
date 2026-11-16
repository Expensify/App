/**
 * Keeps an open Search group's expenses fresh. Both group layouts use it: TransactionGroupListItem on narrow layouts,
 * and GroupChildrenContent under the split header on wide web.
 */
import type {SearchQueryJSON} from '@components/Search/types';

import {search} from '@libs/actions/Search';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef} from 'react';

type UseGroupTransactionsFetchParams = {
    /** The group's own search. A group without one (an expense report, or a violation group) has nothing to fetch */
    transactionsQueryJSON: SearchQueryJSON | undefined;

    /** Whether the group's own search is already running */
    isLoading: boolean;

    /** Whether the group is open */
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

    // Fetch when the group opens, whether from a click or from Enter on the focused row. The hash is a dependency too,
    // because the list can reuse this row for another group that is already open.
    useEffect(() => {
        if (!isExpanded) {
            return;
        }
        fetchFirstPage();
    }, [isExpanded, transactionsQueryJSON?.hash]);

    // Reads isExpanded without depending on it, so the effects below don't fetch again when the group opens. The effect
    // above already covers that.
    const fetchFirstPageIfOpen = useEffectEvent(() => {
        if (!isExpanded) {
            return;
        }
        fetchFirstPage();
    });

    // Refetch when an expense is created in a group that is already open.
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

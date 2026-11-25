import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {useState} from 'react';

import type {SearchTabHold} from './useSearchTabHold';

import useOnyx from './useOnyx';
import usePrevious from './usePrevious';
import useSearchTabHold from './useSearchTabHold';

/** The transactions Search renders from. While a hidden Spend tab is held, they stay as they were when the hold started. */
function useSearchTransactions() {
    const searchTabHold = useSearchTabHold();
    const [heldTransactions, setHeldTransactions] = useState<{hold: SearchTabHold; value: OnyxCollection<Transaction>}>();
    const isHoldCaptured = !!searchTabHold && heldTransactions?.hold === searchTabHold;
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {selector: isHoldCaptured && heldTransactions ? () => heldTransactions.value : undefined});

    // Captured on the first render of each hold. Not cleared when the hold ends, so ending it costs no extra render.
    if (searchTabHold && !isHoldCaptured) {
        setHeldTransactions({hold: searchTabHold, value: transactions});
    }

    // Ending a hold is a catch-up, not an expense update, so the refetch check sees no change. The tab requests fresh
    // results when it is first shown.
    const isSearchTabHeld = !!searchTabHold;
    const previousTransactions = usePrevious(transactions);
    const wasSearchTabHeld = usePrevious(isSearchTabHeld);

    return {transactions, previousTransactions: wasSearchTabHeld && !isSearchTabHeld ? transactions : previousTransactions};
}

export default useSearchTransactions;

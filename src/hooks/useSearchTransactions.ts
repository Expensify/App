import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {useState} from 'react';

import type {SearchTabHold} from './useSearchTabHold';

import useOnyx from './useOnyx';
import usePrevious from './usePrevious';
import useSearchTabHold from './useSearchTabHold';

/**
 * The transactions Search renders from. A hidden Spend tab held by `SearchTabContextHold` keeps the transactions its list
 * was built with, so an expense update does not re-render the hidden list until the tab is shown.
 */
function useSearchTransactions() {
    const searchTabHold = useSearchTabHold();
    const [heldTransactions, setHeldTransactions] = useState<{hold: SearchTabHold; value: OnyxCollection<Transaction>}>();
    const isHoldCaptured = !!searchTabHold && heldTransactions?.hold === searchTabHold;
    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {selector: isHoldCaptured && heldTransactions ? () => heldTransactions.value : undefined});

    // Captured on the first render of each hold. The capture is kept after the hold ends, as nothing reads it then, so
    // ending the hold costs Search no extra render.
    if (searchTabHold && !isHoldCaptured) {
        setHeldTransactions({hold: searchTabHold, value: transactions});
    }

    // The first render after the hold ends goes from the held transactions to the current ones. That is a catch-up, not an
    // expense update. Search is only mounted while held in a tab built by the idle preload, which requests fresh results
    // when it is first shown, so the refetch check sees no change there.
    const isSearchTabHeld = !!searchTabHold;
    const previousTransactions = usePrevious(transactions);
    const wasSearchTabHeld = usePrevious(isSearchTabHeld);

    return {transactions, previousTransactions: wasSearchTabHeld && !isSearchTabHeld ? transactions : previousTransactions};
}

export default useSearchTransactions;

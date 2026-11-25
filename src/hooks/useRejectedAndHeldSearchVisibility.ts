/** Keeps expense recovery searches visible after they first become relevant to the user. */
import {setHasSeenHeldSuggestedSearch, setHasSeenRejectedSuggestedSearch} from '@libs/actions/Search';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect} from 'react';

import useHasHeldExpense from './useHasHeldExpense';
import useHasRejectedExpense from './useHasRejectedExpense';
import useOnyx from './useOnyx';

function useRejectedAndHeldSearchVisibility() {
    const hasRejectedExpense = useHasRejectedExpense();
    const hasHeldExpense = useHasHeldExpense();
    const [hasSeenRejected = false] = useOnyx(ONYXKEYS.NVP_HAS_SEEN_REJECTED_SUGGESTED_SEARCH);
    const [hasSeenHeld = false] = useOnyx(ONYXKEYS.NVP_HAS_SEEN_HELD_SUGGESTED_SEARCH);

    useEffect(() => {
        if (!hasRejectedExpense || hasSeenRejected) {
            return;
        }
        setHasSeenRejectedSuggestedSearch();
    }, [hasRejectedExpense, hasSeenRejected]);

    useEffect(() => {
        if (!hasHeldExpense || hasSeenHeld) {
            return;
        }
        setHasSeenHeldSuggestedSearch();
    }, [hasHeldExpense, hasSeenHeld]);

    return {shouldShowRejectedSuggestion: hasRejectedExpense || hasSeenRejected, shouldShowHeldSuggestion: hasHeldExpense || hasSeenHeld};
}

export default useRejectedAndHeldSearchVisibility;

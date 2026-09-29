import {useLayoutEffect} from 'react';

/*
 * Automatically navigates to the end of a report when a linked action is not available.
 * When a user deep-links or navigates to a specific report action that has been deleted
 * or is otherwise not found, this hook auto-recovers by clearing the reportActionID param
 * and re-fetching the report, effectively showing the report from the end.
 * It runs in a layout effect so the recovery happens before paint, with no intermediate flash.
 */
function useAutoNavigateForDeletedLinkedAction(isLinkedActionUnavailable: boolean, navigateToEndOfReport: () => void) {
    useLayoutEffect(() => {
        if (!isLinkedActionUnavailable) {
            return;
        }

        navigateToEndOfReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLinkedActionUnavailable]);
}

export default useAutoNavigateForDeletedLinkedAction;

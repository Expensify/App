import {useLayoutEffect} from 'react';

/*
 * Automatically navigates to the end of a report when a linked action is not found.
 * When a user deep-links or navigates to a specific report action that has been deleted
 * or is otherwise not found, and the "not found" page would be shown, this hook
 * auto-recovers by clearing the reportActionID param and re-fetching the report,
 * effectively showing the report from the end instead of a dead-end "not found" screen.
 */
function useAutoNavigateForDeletedLinkedAction(shouldShowNotFoundPage: boolean, shouldShowNotFoundLinkedAction: boolean, navigateToEndOfReport: () => void) {
    useLayoutEffect(() => {
        if (!shouldShowNotFoundPage || !shouldShowNotFoundLinkedAction) {
            return;
        }

        navigateToEndOfReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldShowNotFoundLinkedAction]);
}

export default useAutoNavigateForDeletedLinkedAction;

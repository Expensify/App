import {useEffect, useState} from 'react';
import usePrevious from '@hooks/usePrevious';
import Navigation from '@libs/Navigation/Navigation';

/**
 * Tracks whether the user is navigating to a deleted linked action.
 * Distinguishes between:
 * - Normal navigation to a reportActionID that happens to be deleted → shows "Not Found"
 * - An action getting deleted while the user is already highlighting it → clears the param
 *
 * Returns `isNavigatingToDeletedAction` which is used by shouldShowNotFoundLinkedAction.
 */
function useReportActionWasDeleted(
    isLinkedActionDeleted: boolean,
    hasLinkedAction: boolean,
    reportActionIDFromRoute: string | undefined,
    lastReportActionIDFromRoute: string | undefined,
): boolean {
    const prevIsLinkedActionDeleted = usePrevious(hasLinkedAction ? isLinkedActionDeleted : undefined);
    const [isNavigatingToDeletedAction, setIsNavigatingToDeletedAction] = useState(false);

    useEffect(() => {
        // Only handle deletion cases when there's a deleted action
        if (!isLinkedActionDeleted) {
            setIsNavigatingToDeletedAction(false);
            return;
        }

        // we want to do this distinguish between normal navigation and delete behavior
        if (lastReportActionIDFromRoute !== reportActionIDFromRoute) {
            setIsNavigatingToDeletedAction(true);
            return;
        }

        // Clear params when action gets deleted while highlighting
        if (!isNavigatingToDeletedAction && prevIsLinkedActionDeleted === false) {
            Navigation.setParams({reportActionID: ''});
        }
    }, [isLinkedActionDeleted, prevIsLinkedActionDeleted, lastReportActionIDFromRoute, reportActionIDFromRoute, isNavigatingToDeletedAction]);

    return isNavigatingToDeletedAction;
}

export default useReportActionWasDeleted;

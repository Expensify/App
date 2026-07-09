import {isCreatedAction, isCurrentUserPendingAddAction} from '@libs/ReportActionsUtils';

import {useConciergeSessionState} from '@pages/inbox/ConciergeSessionContext';

import ONYXKEYS from '@src/ONYXKEYS';

import useCurrentSessionActionIDs from './useCurrentSessionActionIDs';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsInSidePanel from './useIsInSidePanel';
import useOnyx from './useOnyx';
import useSidePanelState from './useSidePanelState';

/**
 * Returns true when thinking/typing indicators should be hidden. Two cases:
 *   1. The Concierge welcome state — before any real message activity occurs
 *      in either the side panel or the main DM session.
 *   2. The followup-list pending window — between trickle completion and the
 *      server reply with `<followup-list>`.
 */
function useShouldSuppressConciergeIndicators(reportID: string | undefined): boolean {
    const isInSidePanel = useIsInSidePanel();
    const {sessionStartTime: sidePanelSessionStartTime} = useSidePanelState();
    const {sessionStartTime: mainDMSessionStartTime} = useConciergeSessionState();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [pendingFollowupList] = useOnyx(`${ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST}${reportID}`);

    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const isConciergeChat = reportID === conciergeReportID;
    const sessionStartTime = isInSidePanel ? sidePanelSessionStartTime : mainDMSessionStartTime;

    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
    const actionsList = Object.values(reportActions ?? {});

    // IDs of the current session's messages (the user's own and the Concierge replies) captured by
    // arrival, so clock-skewed activity keeps the indicators visible regardless of its timestamp.
    const currentSessionActionIDs = useCurrentSessionActionIDs(actionsList, currentUserAccountID, sessionStartTime);

    const hasSessionActivity =
        !!sessionStartTime &&
        actionsList.some(
            (action) =>
                isCurrentUserPendingAddAction(action, currentUserAccountID) ||
                currentSessionActionIDs.has(action.reportActionID) ||
                (!isCreatedAction(action) && action.created >= sessionStartTime),
        );

    if (pendingFollowupList) {
        return true;
    }

    return isConciergeChat && !hasSessionActivity;
}

export default useShouldSuppressConciergeIndicators;

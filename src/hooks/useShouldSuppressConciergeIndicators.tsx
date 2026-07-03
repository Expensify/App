import {isCreatedAction, isCurrentUserPendingAddAction} from '@libs/ReportActionsUtils';

import {useConciergeSessionState} from '@pages/inbox/ConciergeSessionContext';

import ONYXKEYS from '@src/ONYXKEYS';

import {useMemo} from 'react';

import useCurrentSessionUserActionIDs from './useCurrentSessionUserActionIDs';
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
    const actionsList = useMemo(() => Object.values(reportActions ?? {}), [reportActions]);

    // IDs of the current user's own messages captured while optimistic in this session. Retained after
    // their pendingAction clears so a clock-skewed just-sent message keeps the indicators visible until
    // Concierge replies.
    const currentSessionUserActionIDs = useCurrentSessionUserActionIDs(actionsList, currentUserAccountID, sessionStartTime);

    const hasSessionActivity = useMemo(() => {
        if (!sessionStartTime) {
            return false;
        }
        return actionsList.some(
            (action) =>
                isCurrentUserPendingAddAction(action, currentUserAccountID) ||
                currentSessionUserActionIDs.has(action.reportActionID) ||
                (!isCreatedAction(action) && action.created >= sessionStartTime),
        );
    }, [actionsList, currentUserAccountID, sessionStartTime, currentSessionUserActionIDs]);

    if (pendingFollowupList) {
        return true;
    }

    return isConciergeChat && !hasSessionActivity;
}

export default useShouldSuppressConciergeIndicators;

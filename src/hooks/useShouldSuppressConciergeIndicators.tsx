import {hasUserMessageSinceQuestion} from '@libs/ReportActionFollowupUtils';
import {isCreatedAction, isCurrentUserPendingAddAction} from '@libs/ReportActionsUtils';

import {useConciergeSessionState} from '@pages/inbox/ConciergeSessionContext';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx/ReportAction';

import type {OnyxEntry} from 'react-native-onyx';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsInSidePanel from './useIsInSidePanel';
import useOnyx from './useOnyx';
import useSidePanelState from './useSidePanelState';

/**
 * Returns true when thinking/typing indicators should be hidden. Two cases:
 *   1. The Concierge welcome state — before any real message activity occurs
 *      in either the side panel or the main DM session.
 *   2. The followup-list pending window — between trickle completion and the
 *      server reply with `<followup-list>` — unless the user has sent another
 *      message since that turn's question, which is a turn of its own.
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

    // Derive the boolean inside the Onyx selector so the indicators re-render only when session activity
    // flips, not on every report-action change in the Concierge chat.
    const hasSessionActivitySelector = (actions: OnyxEntry<ReportActions>) => {
        if (!actions || !sessionStartTime) {
            return false;
        }
        return Object.values(actions).some((action) => isCurrentUserPendingAddAction(action, currentUserAccountID) || (!isCreatedAction(action) && action.created >= sessionStartTime));
    };
    const [hasSessionActivity] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        selector: hasSessionActivitySelector,
    });

    const questionReportActionID = pendingFollowupList?.questionReportActionID;
    const hasNewerUserTurnSelector = (actions: OnyxEntry<ReportActions>) => hasUserMessageSinceQuestion(actions, questionReportActionID, CONST.ACCOUNT_ID.CONCIERGE);
    const [hasNewerUserTurn] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        selector: hasNewerUserTurnSelector,
    });

    if (pendingFollowupList && !hasNewerUserTurn) {
        return true;
    }

    return isConciergeChat && !hasSessionActivity;
}

export default useShouldSuppressConciergeIndicators;

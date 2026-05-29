import type {OnyxEntry} from 'react-native-onyx';
import {isCreatedAction} from '@libs/ReportActionsUtils';
import {useConciergeSessionState} from '@pages/inbox/ConciergeSessionContext';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsInSidePanel from './useIsInSidePanel';
import useOnyx from './useOnyx';
import useSidePanelState from './useSidePanelState';

/**
 * Returns true when thinking/typing indicators should be hidden. Two cases:
 *   1. The Concierge welcome state — before the user sends their first message
 *      in either the side panel or the main DM.
 *   2. The followup-list pending window — between trickle completion and the
 *      server reply with `<followup-list>`.
 */
function useShouldSuppressConciergeIndicators(reportID: string | undefined): boolean {
    const isInSidePanel = useIsInSidePanel();
    const {sessionStartTime: sidePanelSessionStartTime} = useSidePanelState();
    const {sessionStartTime: mainDMSessionStartTime} = useConciergeSessionState();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [pendingFollowupList] = useOnyx(`${ONYXKEYS.COLLECTION.CONCIERGE_PENDING_FOLLOWUP_LIST}${reportID}`);

    const isConciergeChat = reportID === conciergeReportID;
    const sessionStartTime = isInSidePanel ? sidePanelSessionStartTime : mainDMSessionStartTime;

    const hasUserSentMessageSelector = (actions: OnyxEntry<ReportActions>) => {
        if (!actions || !sessionStartTime) {
            return false;
        }
        return Object.values(actions).some((action) => !isCreatedAction(action) && action.actorAccountID === currentUserAccountID && action.created >= sessionStartTime);
    };
    const [hasUserSentMessage] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        selector: hasUserSentMessageSelector,
    });

    if (pendingFollowupList) {
        return true;
    }

    return isConciergeChat && !hasUserSentMessage;
}

export default useShouldSuppressConciergeIndicators;

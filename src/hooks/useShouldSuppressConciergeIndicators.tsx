import type {OnyxEntry} from 'react-native-onyx';
import {isCreatedAction} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsInSidePanel from './useIsInSidePanel';
import useOnyx from './useOnyx';
import useSidePanelState from './useSidePanelState';

/**
 * Returns true when thinking/typing indicators should be hidden in the
 * Concierge welcome state — when no messages (from anyone) exist after the
 * session boundary and the user hasn't sent a new message yet.
 *
 * Only active in the side panel where the boundary is available via context.
 * The main DM boundary lives in local useState (no global key), so
 * suppression is not applied there — typing indicators always show.
 */
function useShouldSuppressConciergeIndicators(reportID: string | undefined): boolean {
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const isConciergeChat = reportID === conciergeReportID;

    const isInSidePanel = useIsInSidePanel();
    const {sessionStartTime: sidePanelSessionStartTime} = useSidePanelState();
    const sessionStartTime = isInSidePanel ? sidePanelSessionStartTime : null;

    const hasUserSentMessageSelector = (actions: OnyxEntry<ReportActions>) => {
        if (!actions || !sessionStartTime) {
            return false;
        }
        return Object.values(actions).some((action) => !isCreatedAction(action) && action.actorAccountID === currentUserAccountID && action.created >= sessionStartTime);
    };
    const [hasUserSentMessage] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        selector: hasUserSentMessageSelector,
    });

    const hasUnreadMessagesSelector = (actions: OnyxEntry<ReportActions>) => {
        if (!actions || !sessionStartTime) {
            return false;
        }
        return Object.values(actions).some((action) => !isCreatedAction(action) && action.created > sessionStartTime);
    };
    const [hasUnreadMessages] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        selector: hasUnreadMessagesSelector,
    });

    return isConciergeChat && !!sessionStartTime && !hasUserSentMessage && !hasUnreadMessages;
}

export default useShouldSuppressConciergeIndicators;

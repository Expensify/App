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
 * Concierge welcome state — when the user hasn't sent a message and no
 * unread messages exist after the session boundary.
 *
 * Only active in the side panel where the boundary is available via context.
 * The main DM boundary lives in local useState (no global key), so
 * suppression is not applied there — typing indicators always show.
 */
function useShouldSuppressConciergeIndicators(reportID: string | undefined): boolean {
    const isInSidePanel = useIsInSidePanel();
    const {sessionStartTime} = useSidePanelState();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const isConciergeChat = reportID === conciergeReportID;

    const shouldSuppressSelector = (actions: OnyxEntry<ReportActions>) => {
        if (!actions || !sessionStartTime) {
            return false;
        }
        const hasUserSentMessage = Object.values(actions).some((action) => !isCreatedAction(action) && action.actorAccountID === currentUserAccountID && action.created >= sessionStartTime);
        if (hasUserSentMessage) {
            return false;
        }
        const hasUnreadMessages = Object.values(actions).some((action) => !isCreatedAction(action) && action.created > sessionStartTime);
        return !hasUnreadMessages;
    };
    const [shouldSuppress] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        selector: shouldSuppressSelector,
    });

    return isConciergeChat && isInSidePanel && !!shouldSuppress;
}

export default useShouldSuppressConciergeIndicators;

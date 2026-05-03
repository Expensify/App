import type {OnyxEntry} from 'react-native-onyx';
import {isCreatedAction} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import useConciergeSessionStartTime from './useConciergeSessionStartTime';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

/**
 * Returns true when thinking/typing indicators should be hidden in the
 * Concierge welcome state — when no messages (from anyone) exist after the
 * session boundary and the user hasn't sent a new message yet.
 */
function useShouldSuppressConciergeIndicators(reportID: string | undefined): boolean {
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    const isConciergeChat = reportID === conciergeReportID;
    const sessionStartTime = useConciergeSessionStartTime(isConciergeChat, report?.lastReadTime);

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

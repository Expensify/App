import type {OnyxEntry} from 'react-native-onyx';
import {isCreatedAction} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import useConciergeSessionStartTime from './useConciergeSessionStartTime';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

/**
 * Returns true when thinking/typing indicators should be hidden in the
 * Concierge welcome state — before the user sends their first message
 * in the current session (both side panel and main DM).
 */
function useShouldSuppressConciergeIndicators(reportID: string | undefined): boolean {
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const isConciergeChat = reportID === conciergeReportID;
    const sessionStartTime = useConciergeSessionStartTime(isConciergeChat);

    const hasUserSentMessageSelector = (actions: OnyxEntry<ReportActions>) => {
        if (!actions || !sessionStartTime) {
            return false;
        }
        return Object.values(actions).some((action) => !isCreatedAction(action) && action.actorAccountID === currentUserAccountID && action.created >= sessionStartTime);
    };
    const [hasUserSentMessage] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        selector: hasUserSentMessageSelector,
    });

    return isConciergeChat && !!sessionStartTime && !hasUserSentMessage;
}

export default useShouldSuppressConciergeIndicators;

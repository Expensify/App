import type {OnyxEntry} from 'react-native-onyx';
import {isCreatedAction} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsInSidePanel from './useIsInSidePanel';
import useOnyx from './useOnyx';
import useSidePanelState from './useSidePanelState';

/**
 * Returns true when thinking/typing indicators should be hidden in the side-panel
 * welcome state — specifically for Concierge DMs before the user sends their first message.
 */
function useShouldSuppressConciergeIndicators(reportID: string | undefined): boolean {
    const isInSidePanel = useIsInSidePanel();
    const {sessionStartTime} = useSidePanelState();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const isConciergeChat = reportID === conciergeReportID;

    const hasUserSentMessageSelector = (actions: OnyxEntry<ReportActions>) => {
        if (!actions || !sessionStartTime) {
            return false;
        }
        return Object.values(actions).some((action) => !isCreatedAction(action) && action.actorAccountID === currentUserAccountID && action.created >= sessionStartTime);
    };
    const [hasUserSentMessage] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        selector: hasUserSentMessageSelector,
    });

    return isConciergeChat && isInSidePanel && !hasUserSentMessage;
}

export default useShouldSuppressConciergeIndicators;

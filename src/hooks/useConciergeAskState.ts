import {isCreatedAction, isCurrentUserPendingAddAction} from '@libs/ReportActionsUtils';

import {useConciergeSessionState} from '@pages/inbox/ConciergeSessionContext';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx/ReportAction';

import type {OnyxEntry} from 'react-native-onyx';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsInSidePanel from './useIsInSidePanel';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

type ConciergeAskState = {
    /** Whether this is the Concierge chat in the Inbox and the beta is on */
    isAskConciergeChat: boolean;

    /** Whether the messages from before this session are shown */
    isHistoryExpanded: boolean;

    /** Whether to show the `Ask me anything!` welcome screen */
    shouldShowWelcome: boolean;

    /** Whether to show `Ask a new question` above the composer */
    shouldLabelComposerAsNewQuestion: boolean;
};

function useConciergeAskState(reportID: string | undefined): ConciergeAskState {
    const {isBetaEnabled} = usePermissions();
    const isInSidePanel = useIsInSidePanel();
    const {sessionStartTime, showFullHistory} = useConciergeSessionState();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const hasSessionActivitySelector = (actions: OnyxEntry<ReportActions>) => {
        if (!actions || !sessionStartTime) {
            return false;
        }
        return Object.values(actions).some((action) => isCurrentUserPendingAddAction(action, currentUserAccountID) || (!isCreatedAction(action) && action.created >= sessionStartTime));
    };
    const [hasSessionActivity] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        selector: hasSessionActivitySelector,
    });

    const isAskConciergeChat = !!reportID && reportID === conciergeReportID && !isInSidePanel && isBetaEnabled(CONST.BETAS.CONCIERGE_RESPOND_IN_THREAD);

    const hasSessionBoundary = isAskConciergeChat && !!sessionStartTime;

    return {
        isAskConciergeChat,
        isHistoryExpanded: showFullHistory,
        shouldShowWelcome: hasSessionBoundary && !showFullHistory && !hasSessionActivity,
        shouldLabelComposerAsNewQuestion: hasSessionBoundary && showFullHistory && !hasSessionActivity,
    };
}

export default useConciergeAskState;

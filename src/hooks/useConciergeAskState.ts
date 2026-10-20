import {isCreatedAction} from '@libs/ReportActionsUtils';

import {useConciergeChatHistoryState} from '@pages/inbox/ConciergeChatHistoryContext';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx/ReportAction';

import type {OnyxEntry} from 'react-native-onyx';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsInSidePanel from './useIsInSidePanel';
import useOnyx from './useOnyx';
import useResponsiveLayout from './useResponsiveLayout';

type ConciergeAskState = {
    /** Whether this is the Concierge chat in the Inbox */
    isAskConciergeChat: boolean;

    /** Whether the earlier conversation is shown */
    isHistoryExpanded: boolean;

    /** Whether to show the `Ask me anything!` welcome screen in place of the messages */
    shouldShowWelcome: boolean;

    /** Whether the welcome screen and the composer are centered together on the screen */
    shouldCenterWelcomeWithComposer: boolean;

    /** Whether to show `Ask a new question` above the composer */
    shouldLabelComposerAsNewQuestion: boolean;
};

function useConciergeAskState(reportID: string | undefined): ConciergeAskState {
    const isInSidePanel = useIsInSidePanel();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {showFullHistory} = useConciergeChatHistoryState();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const isAskConciergeChat = !!reportID && reportID === conciergeReportID && !isInSidePanel;

    const shouldKeepMessagesOnScreenSelector = (actions: OnyxEntry<ReportActions>) => {
        if (!isAskConciergeChat || !actions) {
            return false;
        }
        const allActions = Object.values(actions);

        // The user's earlier messages may be on an older page.
        if (!allActions.some((action) => isCreatedAction(action))) {
            return false;
        }

        const messages = allActions.filter((action) => !isCreatedAction(action));
        return messages.length > 0 && !messages.some((action) => action.actorAccountID === currentUserAccountID);
    };
    const [shouldKeepMessagesOnScreen] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        selector: shouldKeepMessagesOnScreenSelector,
    });

    const shouldShowWelcome = isAskConciergeChat && !showFullHistory && !shouldKeepMessagesOnScreen;

    return {
        isAskConciergeChat,
        isHistoryExpanded: showFullHistory,
        shouldShowWelcome,
        shouldCenterWelcomeWithComposer: shouldShowWelcome && !shouldUseNarrowLayout,
        shouldLabelComposerAsNewQuestion: isAskConciergeChat && showFullHistory,
    };
}

export default useConciergeAskState;

import {isCreatedAction} from '@libs/ReportActionsUtils';

import {useConciergeChatHistoryState} from '@pages/inbox/ConciergeChatHistoryContext';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx/ReportAction';

import type {OnyxEntry} from 'react-native-onyx';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsAskConciergeChat from './useIsAskConciergeChat';
import useOnyx from './useOnyx';
import useResponsiveLayout from './useResponsiveLayout';

type ConciergeAskState = {
    /** Whether the earlier conversation of the Concierge chat in the Inbox is shown */
    isHistoryExpanded: boolean;

    /** Whether to show the `Ask me anything!` welcome screen in place of the messages */
    shouldShowWelcome: boolean;

    /** Whether the welcome screen and the composer are centered together on the screen */
    shouldCenterWelcomeWithComposer: boolean;
};

function useConciergeAskState(reportID: string | undefined): ConciergeAskState {
    const isAskConciergeChat = useIsAskConciergeChat(reportID);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {showFullHistory} = useConciergeChatHistoryState();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

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
        isHistoryExpanded: isAskConciergeChat && showFullHistory,
        shouldShowWelcome,
        shouldCenterWelcomeWithComposer: shouldShowWelcome && !shouldUseNarrowLayout,
    };
}

export default useConciergeAskState;

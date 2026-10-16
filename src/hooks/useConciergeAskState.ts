import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import {isCreatedAction, isCurrentUserPendingAddAction} from '@libs/ReportActionsUtils';

import {useConciergeSessionState} from '@pages/inbox/ConciergeSessionContext';

import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {ReportActions} from '@src/types/onyx/ReportAction';

import type {OnyxEntry} from 'react-native-onyx';

import {useRoute} from '@react-navigation/native';

import {isOpenChildTaskAction} from './useConciergeSidePanelReportActions';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsInSidePanel from './useIsInSidePanel';
import useOnyx from './useOnyx';
import useResponsiveLayout from './useResponsiveLayout';

type ConciergeAskState = {
    /** Whether this is the Concierge chat in the Inbox */
    isAskConciergeChat: boolean;

    /** Whether the messages from before this session are shown */
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
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const {sessionStartTime, showFullHistory} = useConciergeSessionState();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const hasSessionActivitySelector = (actions: OnyxEntry<ReportActions>) => {
        if (!actions || !sessionStartTime) {
            return false;
        }
        return Object.values(actions).some((action) => {
            // The list pins a still-open task, so it stays on screen in every session.
            if (isOpenChildTaskAction(action, currentUserAccountID)) {
                return true;
            }

            // An action that opens its own report, like a question's thread or a task, keeps the welcome both while sending and once sent.
            // Otherwise reconnecting would switch this chat to a partial view that `Hide chat history` can't return to.
            if (action.actorAccountID === currentUserAccountID && !!action.childReportID) {
                return false;
            }
            return isCurrentUserPendingAddAction(action, currentUserAccountID) || (!isCreatedAction(action) && action.created >= sessionStartTime);
        });
    };
    const [hasSessionActivity] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        selector: hasSessionActivitySelector,
    });

    // `View chat history` only appears once the user has messaged Concierge, so earlier messages without one stay on screen.
    const hasHistoryWithoutUserMessageSelector = (actions: OnyxEntry<ReportActions>) => {
        if (!actions || !sessionStartTime) {
            return false;
        }
        const allActions = Object.values(actions);

        // Until the chat's first action is loaded, the user's earlier messages may be on an older page.
        if (!allActions.some((action) => isCreatedAction(action))) {
            return false;
        }
        const previousActions = allActions.filter((action) => !isCreatedAction(action) && action.created < sessionStartTime);
        return previousActions.length > 0 && !previousActions.some((action) => action.actorAccountID === currentUserAccountID);
    };
    const [hasHistoryWithoutUserMessage] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        selector: hasHistoryWithoutUserMessageSelector,
    });

    const isAskConciergeChat = !!reportID && reportID === conciergeReportID && !isInSidePanel;

    const hasSessionBoundary = isAskConciergeChat && !!sessionStartTime;

    // A linked action opens the report at that message, so the earlier conversation is on screen either way.
    const isHistoryExpanded = showFullHistory || !!route.params?.reportActionID;

    const shouldShowWelcome = hasSessionBoundary && !isHistoryExpanded && !hasSessionActivity && !hasHistoryWithoutUserMessage;

    return {
        isAskConciergeChat,
        isHistoryExpanded,
        shouldShowWelcome,
        shouldCenterWelcomeWithComposer: shouldShowWelcome && !shouldUseNarrowLayout,
        shouldLabelComposerAsNewQuestion: hasSessionBoundary && showFullHistory && !hasSessionActivity,
    };
}

export default useConciergeAskState;

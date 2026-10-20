import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import {isCreatedAction, isDeletedParentAction} from '@libs/ReportActionsUtils';

import {useConciergeChatHistoryState} from '@pages/inbox/ConciergeChatHistoryContext';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {ReportAction, ReportActions} from '@src/types/onyx/ReportAction';

import type {OnyxEntry} from 'react-native-onyx';

import {useRoute} from '@react-navigation/native';

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

/** An OPEN task assigned to the current user. Canceled tasks stay OPEN optimistically, so deleted parents are excluded. */
function isOpenChildTaskAction(action: ReportAction, currentUserAccountID: number): boolean {
    return (
        action.childType === CONST.REPORT.TYPE.TASK &&
        action.childManagerAccountID === currentUserAccountID &&
        action.childStateNum === CONST.REPORT.STATE_NUM.OPEN &&
        action.childStatusNum === CONST.REPORT.STATUS_NUM.OPEN &&
        !isDeletedParentAction(action)
    );
}

function useConciergeAskState(reportID: string | undefined): ConciergeAskState {
    const isInSidePanel = useIsInSidePanel();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const {showFullHistory} = useConciergeChatHistoryState();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    // A task the user still has to finish keeps the chat on screen.
    const hasOpenTaskSelector = (actions: OnyxEntry<ReportActions>) => !!actions && Object.values(actions).some((action) => isOpenChildTaskAction(action, currentUserAccountID));
    const [hasOpenTask] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        selector: hasOpenTaskSelector,
    });

    // `View chat history` only appears once the user has messaged Concierge, so earlier messages without one stay on screen.
    const hasHistoryWithoutUserMessageSelector = (actions: OnyxEntry<ReportActions>) => {
        if (!actions) {
            return false;
        }
        const allActions = Object.values(actions);

        // Until the chat's first action is loaded, the user's earlier messages may be on an older page.
        if (!allActions.some((action) => isCreatedAction(action))) {
            return false;
        }
        const messages = allActions.filter((action) => !isCreatedAction(action));
        return messages.length > 0 && !messages.some((action) => action.actorAccountID === currentUserAccountID);
    };
    const [hasHistoryWithoutUserMessage] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        selector: hasHistoryWithoutUserMessageSelector,
    });

    const isAskConciergeChat = !!reportID && reportID === conciergeReportID && !isInSidePanel;

    // A linked action opens the report at that message, so the earlier conversation is on screen either way.
    const isHistoryExpanded = showFullHistory || !!route.params?.reportActionID;

    const shouldShowWelcome = isAskConciergeChat && !isHistoryExpanded && !hasOpenTask && !hasHistoryWithoutUserMessage;

    return {
        isAskConciergeChat,
        isHistoryExpanded,
        shouldShowWelcome,
        shouldCenterWelcomeWithComposer: shouldShowWelcome && !shouldUseNarrowLayout,
        shouldLabelComposerAsNewQuestion: isAskConciergeChat && showFullHistory,
    };
}

export default useConciergeAskState;

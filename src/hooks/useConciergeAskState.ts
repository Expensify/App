import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import {isCreatedAction, isReportActionUnread} from '@libs/ReportActionsUtils';

import {useConciergeChatHistoryState} from '@pages/inbox/ConciergeChatHistoryContext';

import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {useRoute} from '@react-navigation/native';

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

    /** Whether the Concierge chat has a message from someone else that the user hasn't read */
    hasUnreadMessageFromOthers: boolean;
};

function useConciergeAskState(reportID: string | undefined): ConciergeAskState {
    const isAskConciergeChat = useIsAskConciergeChat(reportID);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {showFullHistory} = useConciergeChatHistoryState();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [lastReadTime] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: (report) => report?.lastReadTime});

    const shouldKeepMessagesOnScreenSelector = (actions: OnyxEntry<ReportActions>) => {
        if (!isAskConciergeChat || !actions) {
            return false;
        }
        const allActions = Object.values(actions);

        // A failed send stays on screen so the user can retry or dismiss it.
        if (allActions.some((action) => !isEmptyObject(action.errors))) {
            return true;
        }

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

    const hasUnreadMessageFromOthersSelector = (actions: OnyxEntry<ReportActions>) =>
        isAskConciergeChat && !!lastReadTime && Object.values(actions ?? {}).some((action) => action.actorAccountID !== currentUserAccountID && isReportActionUnread(action, lastReadTime));
    const [hasUnreadMessageFromOthers = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        selector: hasUnreadMessageFromOthersSelector,
    });

    const isHistoryExpanded = isAskConciergeChat && (showFullHistory || !!route.params?.reportActionID);
    const shouldShowWelcome = isAskConciergeChat && !isHistoryExpanded && !shouldKeepMessagesOnScreen && !hasUnreadMessageFromOthers;

    return {
        isHistoryExpanded,
        shouldShowWelcome,
        shouldCenterWelcomeWithComposer: shouldShowWelcome && !shouldUseNarrowLayout,
        hasUnreadMessageFromOthers,
    };
}

export default useConciergeAskState;

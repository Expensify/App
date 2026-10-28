import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';

import {useConciergeChatHistoryState} from '@pages/inbox/ConciergeChatHistoryContext';

import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {useRoute} from '@react-navigation/native';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsConciergeInboxDM from './useIsConciergeInboxDM';
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
    const isConciergeInboxDM = useIsConciergeInboxDM(reportID);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {showFullHistory, isHistoryCollapsedByUser} = useConciergeChatHistoryState();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const hasFailedSendSelector = (actions: OnyxEntry<ReportActions>) => {
        if (!isConciergeInboxDM || !actions) {
            return false;
        }

        // A failed send stays on screen so the user can retry or dismiss it.
        return Object.values(actions).some((action) => !isEmptyObject(action.errors));
    };
    const [hasFailedSend] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        selector: hasFailedSendSelector,
    });

    const hasUnreadMessageFromOthersSelector = (report: OnyxEntry<Report>) =>
        isConciergeInboxDM && !!report?.lastReadTime && (report.lastVisibleActionCreated ?? '') > report.lastReadTime && report.lastActorAccountID !== currentUserAccountID;
    const [hasUnreadMessageFromOthers = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        selector: hasUnreadMessageFromOthersSelector,
    });

    const isHistoryExpanded = isConciergeInboxDM && (showFullHistory || !!route.params?.reportActionID);
    const shouldShowWelcome = isConciergeInboxDM && !isHistoryExpanded && (isHistoryCollapsedByUser || !hasFailedSend) && !hasUnreadMessageFromOthers;

    return {
        isHistoryExpanded,
        shouldShowWelcome,
        shouldCenterWelcomeWithComposer: shouldShowWelcome && !shouldUseNarrowLayout,
        hasUnreadMessageFromOthers,
    };
}

export default useConciergeAskState;

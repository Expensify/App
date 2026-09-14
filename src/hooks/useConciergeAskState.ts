import {isCreatedAction, isCurrentUserPendingAddAction} from '@libs/ReportActionsUtils';

import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@navigation/types';

import {useConciergeSessionState} from '@pages/inbox/ConciergeSessionContext';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {ReportActions} from '@src/types/onyx/ReportAction';

import type {OnyxEntry} from 'react-native-onyx';

import {useRoute} from '@react-navigation/native';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsInSidePanel from './useIsInSidePanel';
import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

type ConciergeAskState = {
    /** Whether this is the main Concierge DM with the Ask Concierge design enabled */
    isAskConciergeChat: boolean;

    /** Whether the conversation from before the session boundary is currently shown */
    isHistoryExpanded: boolean;

    /** Whether to show the welcome empty state */
    shouldShowWelcome: boolean;

    /** Whether to label the composer as the start of a new question, which it is once earlier history is expanded */
    shouldLabelComposerAsNewQuestion: boolean;
};

function useConciergeAskState(reportID: string | undefined): ConciergeAskState {
    const {isBetaEnabled} = usePermissions();
    const isInSidePanel = useIsInSidePanel();
    const {sessionStartTime, showFullHistory} = useConciergeSessionState();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
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

    const isHistoryExpanded = showFullHistory || !!route?.params?.reportActionID;

    return {
        isAskConciergeChat,
        isHistoryExpanded,
        shouldShowWelcome: hasSessionBoundary && !isHistoryExpanded && !hasSessionActivity,
        shouldLabelComposerAsNewQuestion: hasSessionBoundary && isHistoryExpanded && !hasSessionActivity,
    };
}

export default useConciergeAskState;

import {useIsFocused} from '@react-navigation/native';
import {useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import {isCreatedAction} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useIsInSidePanel from './useIsInSidePanel';
import useOnyx from './useOnyx';
import useSidePanelState from './useSidePanelState';

/**
 * Returns true when thinking/typing indicators should be hidden in the
 * Concierge welcome state — before the user sends their first message
 * in the current session (both side panel and main DM).
 */
function useShouldSuppressConciergeIndicators(reportID: string | undefined): boolean {
    const isInSidePanel = useIsInSidePanel();
    const isFocused = useIsFocused();
    const {sessionStartTime: sidePanelSessionStartTime} = useSidePanelState();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const isConciergeChat = reportID === conciergeReportID;
    const shouldHideConciergeDM = !isFocused || !isConciergeChat || isInSidePanel;
    const [mainDMSessionStartTime, setMainDMSessionStartTime] = useState<string | null>(null);
    const [prevShouldHideConciergeDM, setPrevShouldHideConciergeDM] = useState(true);

    if (prevShouldHideConciergeDM !== shouldHideConciergeDM) {
        setPrevShouldHideConciergeDM(shouldHideConciergeDM);
        if (!shouldHideConciergeDM) {
            setMainDMSessionStartTime(DateUtils.getDBTime());
        }
    }
    const sessionStartTime = isInSidePanel ? sidePanelSessionStartTime : mainDMSessionStartTime;

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

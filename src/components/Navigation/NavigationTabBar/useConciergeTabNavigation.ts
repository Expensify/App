import useOnyx from '@hooks/useOnyx';

import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import {getTabNavigatorStateKey} from '@libs/Navigation/helpers/tabNavigatorUtils';

import navigationRef from '@navigation/navigationRef';

import {openConciergePage} from '@userActions/ConciergeThreads';

import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {TabActions} from '@react-navigation/native';

/** Returns the handler that opens the Concierge page on the given conversation, or on its new conversation screen, /concierge. */
function useConciergeTabNavigation(isConciergeSelected: boolean) {
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    return (conversationReportID?: string) => {
        if (!conciergeReportID) {
            return;
        }
        clearSelectedText();
        if (isConciergeSelected) {
            openConciergePage(conversationReportID);
            return;
        }

        // Jumping to the existing tab keeps the Concierge page mounted, where a navigation to its path would push a new tab navigator
        const tabNavigatorStateKey = getTabNavigatorStateKey(navigationRef.getRootState());
        if (!tabNavigatorStateKey) {
            openConciergePage(conversationReportID);
            return;
        }
        navigationRef.dispatch({
            ...TabActions.jumpTo(NAVIGATORS.CONCIERGE_SPLIT_NAVIGATOR, {screen: SCREENS.REPORT, params: {reportID: conversationReportID ?? conciergeReportID}}),
            target: tabNavigatorStateKey,
        });
    };
}

export default useConciergeTabNavigation;

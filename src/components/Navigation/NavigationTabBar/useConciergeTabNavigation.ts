import useConciergeConversationToOpen from '@hooks/useConciergeConversationToOpen';
import useOnyx from '@hooks/useOnyx';

import clearSelectedText from '@libs/clearSelectedText/clearSelectedText';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {getTabNavigatorStateKey} from '@libs/Navigation/helpers/tabNavigatorUtils';

import navigationRef from '@navigation/navigationRef';

import {openConciergeConversation} from '@userActions/ConciergeThreads';

import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {TabActions} from '@react-navigation/native';

/** Returns the handler that opens the Concierge page on the most recent unread conversation, or on a new conversation. */
function useConciergeTabNavigation(isConciergeSelected: boolean) {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const findOrCreateConciergeConversation = useConciergeConversationToOpen();

    return () => {
        if (isConciergeSelected) {
            return;
        }
        clearSelectedText();
        interceptAnonymousUser(() => {
            const reportID = findOrCreateConciergeConversation();
            if (!reportID) {
                return;
            }

            // Jumping to the existing tab keeps the Concierge page mounted, where a navigation to its path would push a new tab navigator
            const tabNavigatorStateKey = getTabNavigatorStateKey(navigationRef.getRootState());
            if (!tabNavigatorStateKey) {
                openConciergeConversation(reportID);
                return;
            }
            navigationRef.dispatch({
                ...TabActions.jumpTo(NAVIGATORS.CONCIERGE_SPLIT_NAVIGATOR, {screen: SCREENS.REPORT, params: {reportID}}),
                target: tabNavigatorStateKey,
            });
        }, session);
    };
}

export default useConciergeTabNavigation;

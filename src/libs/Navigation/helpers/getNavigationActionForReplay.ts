/**
 * Prepares a navigation that a "Discard changes?" prompt blocked, so sending it again after Discard resumes it.
 */
import navigationRef from '@libs/Navigation/navigationRef';

import CONST from '@src/CONST';

import type {NavigationAction} from '@react-navigation/native';

const BACK_ACTION_TYPES = new Set<string>([CONST.NAVIGATION.ACTION_TYPE.GO_BACK, CONST.NAVIGATION.ACTION_TYPE.POP]);

/**
 * Makes Discard close the whole RHP when the user clicked outside it.
 *
 * That click sends a "go back" with no target from the RHP's route, so the root closes the RHP. Sent again as is, the innermost
 * navigator handles it and only closes the top screen, so it's aimed at the root instead. Other actions are returned unchanged.
 * The copy keeps react-navigation's marker that stops the same screen from blocking it again.
 */
function getNavigationActionForReplay(action: NavigationAction): NavigationAction {
    if (action.target || !action.source || !BACK_ACTION_TYPES.has(action.type)) {
        return action;
    }

    const rootState = navigationRef.isReady() ? navigationRef.getRootState() : undefined;
    if (!rootState?.routes.some((route) => route.key === action.source)) {
        return action;
    }

    return {...action, target: rootState.key};
}

export default getNavigationActionForReplay;

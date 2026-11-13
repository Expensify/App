/**
 * Prepares a navigation that a "Discard changes?" prompt blocked, so sending it again after Discard does what it first did.
 */
import navigationRef from '@libs/Navigation/navigationRef';

import CONST from '@src/CONST';

import type {NavigationAction} from '@react-navigation/native';

const BACK_ACTION_TYPES = new Set<string>([CONST.NAVIGATION.ACTION_TYPE.GO_BACK, CONST.NAVIGATION.ACTION_TYPE.POP]);

/**
 * Makes Discard close the whole RHP when the user clicked outside it.
 *
 * Clicking outside the RHP sends a "go back" with no target, which the top-level navigator handles by closing the RHP. After the
 * user picks Discard, that action is sent again, but this time react-navigation hands it to the innermost navigator, which only
 * closes the top screen and leaves the RHP open. Targeting the top-level navigator makes it close the RHP, like the original click.
 * Other actions are returned unchanged. The copy keeps react-navigation's hidden marker that stops the same screen from blocking it again.
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

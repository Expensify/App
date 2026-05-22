import {StackActions} from '@react-navigation/native';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {RootNavigatorParamList, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import getActiveTabName from './getActiveTabName';

/**
 * If the previous page is REPORTS_SPLIT_NAVIGATOR we navigate back to it
 * otherwise we go back to WORKSPACES_LIST page.
 */
function goBackFromWorkspaceSettingPages() {
    const rootState = navigationRef.getRootState() as State<RootNavigatorParamList>;
    const secondToLastRoute = rootState.routes.at(-2);

    const isPreviousInbox = getActiveTabName(secondToLastRoute) === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR;

    if (isPreviousInbox) {
        // Cross-tab PUSH stacks a new TAB_NAVIGATOR on the root. dismissModal() doesn't handle
        // TAB_NAVIGATOR routes, so pop directly to the underlying navigator instead.
        const topRootIndex = rootState.index ?? rootState.routes.length - 1;
        const underlyingTabNavIndex = rootState.routes.findLastIndex((route, idx) => idx < topRootIndex && route.name === NAVIGATORS.TAB_NAVIGATOR);
        if (underlyingTabNavIndex !== -1) {
            navigationRef.current?.dispatch({...StackActions.pop(topRootIndex - underlyingTabNavIndex), target: rootState.key});
            return;
        }
        Navigation.dismissModal();
    } else {
        Navigation.goBack(ROUTES.WORKSPACES_LIST.route);
    }
}
export default goBackFromWorkspaceSettingPages;

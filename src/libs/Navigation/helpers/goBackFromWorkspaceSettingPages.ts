import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {RootNavigatorParamList, RootTabNavigatorParamList, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';

/**
 * If the previous page is REPORTS_SPLIT_NAVIGATOR we navigate back to it
 * otherwise we go back to WORKSPACES_LIST page.
 */
function goBackFromWorkspaceSettingPages() {
    const rootState = navigationRef.getRootState() as State<RootNavigatorParamList>;
    const secondToLastRoute = rootState.routes.at(-2);

    const isPreviousInbox =
        secondToLastRoute?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR ||
        (secondToLastRoute?.name === NAVIGATORS.ROOT_TAB_NAVIGATOR &&
            (() => {
                const tabState = secondToLastRoute.state as {routes: {name: keyof RootTabNavigatorParamList}[]; index: number} | undefined;
                return tabState?.routes?.[tabState?.index ?? 0]?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR;
            })());

    if (isPreviousInbox) {
        Navigation.dismissModal();
    } else {
        Navigation.goBack(ROUTES.WORKSPACES_LIST.route);
    }
}
export default goBackFromWorkspaceSettingPages;

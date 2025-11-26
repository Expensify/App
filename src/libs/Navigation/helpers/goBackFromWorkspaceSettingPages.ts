import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {RootNavigatorParamList, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';

/**
 * If the previous page is REPORTS_SPLIT_NAVIGATOR we navigate back to it
 * otherwise we go back to WORKSPACES_LIST page.
 */
function goBackFromWorkspaceSettingPages() {
    const rootState = navigationRef.getRootState() as State<RootNavigatorParamList>;
    const secondToLastRoute = rootState.routes.at(-2);

    if (secondToLastRoute?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
        Navigation.dismissModal();
    } else {
        Navigation.goBack(ROUTES.WORKSPACES_LIST.route);
    }
}
export default goBackFromWorkspaceSettingPages;

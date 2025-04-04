import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';

/**
 * If there are already other screens open in WorkspaceSplitNavigator, we return to the previous one.
 * If not, from the central screen in WorkspaceSplitNavigator we should return to the WorkspaceInitialPage.
 */
function goBackFromWorkspaceCentralScreen(policyID: string | undefined) {
    const rootState = navigationRef.getRootState();
    const lastRoute = rootState.routes.at(-1);

    if (lastRoute?.name !== NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
        Log.hmmm('[goBackFromWorkspaceCentralScreen] goBackFromWorkspaceCentralScreen was called from a different navigator than WorkspaceSplitNavigator.');
        return;
    }

    if (lastRoute.state?.routes && lastRoute.state.routes.length > 1) {
        Navigation.goBack(undefined, {shouldPopToTop: true});
        return;
    }

    Navigation.goBack(ROUTES.WORKSPACE_INITIAL.getRoute(policyID));
}

export default goBackFromWorkspaceCentralScreen;

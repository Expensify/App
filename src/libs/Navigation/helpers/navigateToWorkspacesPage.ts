import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {isPendingDeletePolicy, shouldShowPolicy as shouldShowPolicyUtil} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import {isFullScreenName, isWorkspacesTabScreenName} from './isNavigatorName';
import {getLastVisitedWorkspaceTabScreen, getWorkspacesTabStateFromSessionStorage} from './lastVisitedTabPathUtils';

type Params = {
    currentUserLogin?: string;
    shouldUseNarrowLayout: boolean;
    policy?: Policy;
};

const getWorkspaceNavigationRouteState = () => {
    const rootState = navigationRef.getRootState();
    const topmostFullScreenRoute = rootState?.routes?.findLast((route) => isFullScreenName(route.name));
    if (!topmostFullScreenRoute) {
        return {};
    }
    const workspacesTabStateFromSessionStorage = getWorkspacesTabStateFromSessionStorage() ?? rootState;
    const lastWorkspacesTabNavigatorRoute = workspacesTabStateFromSessionStorage?.routes.findLast((route) => isWorkspacesTabScreenName(route.name));
    let workspacesTabState = lastWorkspacesTabNavigatorRoute?.state;

    if (!workspacesTabState && lastWorkspacesTabNavigatorRoute?.key) {
        workspacesTabState = getPreservedNavigatorState(lastWorkspacesTabNavigatorRoute.key);
    }

    return {lastWorkspacesTabNavigatorRoute, workspacesTabState, topmostFullScreenRoute};
};

const navigateToWorkspacesPage = ({currentUserLogin, shouldUseNarrowLayout, policy}: Params) => {
    const {lastWorkspacesTabNavigatorRoute, topmostFullScreenRoute} = getWorkspaceNavigationRouteState();
    if (!topmostFullScreenRoute) {
        return;
    }

    if (topmostFullScreenRoute.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
        Navigation.goBack(ROUTES.WORKSPACES_LIST.route);
        return;
    }

    interceptAnonymousUser(() => {
        // If there is no settings or workspace navigator route, then we should open the settings navigator.
        if (!lastWorkspacesTabNavigatorRoute) {
            Navigation.navigate(ROUTES.WORKSPACES_LIST.route);
            return;
        }

        // If there is a workspace navigator route, then we should open the workspace initial screen as it should be "remembered".
        if (lastWorkspacesTabNavigatorRoute.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
            // Screens of this navigator should always have policyID
            const shouldShowPolicy = shouldShowPolicyUtil(policy, false, currentUserLogin);
            const isPendingDelete = isPendingDeletePolicy(policy);

            if (!shouldShowPolicy || isPendingDelete) {
                Navigation.navigate(ROUTES.WORKSPACES_LIST.route);
                return;
            }

            if (policy?.id) {
                const workspaceScreenName = !shouldUseNarrowLayout ? getLastVisitedWorkspaceTabScreen() : SCREENS.WORKSPACE.INITIAL;
                // This action will put settings split under the workspace split to make sure that we can swipe back to settings split.
                navigationRef.dispatch({type: CONST.NAVIGATION.ACTION_TYPE.OPEN_WORKSPACE_SPLIT, payload: {policyID: policy?.id, screenName: workspaceScreenName}});
            }
            return;
        }

        Navigation.navigate(ROUTES.WORKSPACES_LIST.route);
    });
};

export default navigateToWorkspacesPage;
export {getWorkspaceNavigationRouteState};

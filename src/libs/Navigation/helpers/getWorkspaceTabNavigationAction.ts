import type {NavigationAction as NavigationActionType} from '@react-navigation/routers';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import navigationRef from '@libs/Navigation/navigationRef';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getPolicy, isPendingDeletePolicy, shouldShowPolicy as shouldShowPolicyUtil} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {isFullScreenName, isWorkspacesTabScreenName} from './isNavigatorName';
import {getLastVisitedWorkspaceTabScreen, getWorkspacesTabStateFromSessionStorage} from './lastVisitedTabPathUtils';

type Params = {
    currentUserLogin?: string;
    shouldUseNarrowLayout: boolean;
};

type NavigationAction =
    | {type: 'goBack'; route: Route}
    | {type: 'navigate'; route: Route}
    | {type: 'dispatch'; dispatchType: string; payload: NavigationActionType['payload']}
    | {type: 'return'};

const getWorkspaceTabNavigationAction = ({currentUserLogin, shouldUseNarrowLayout}: Params): NavigationAction => {
    const rootState = navigationRef.getRootState();
    const topmostFullScreenRoute = rootState.routes.findLast((route) => isFullScreenName(route.name));
    if (!topmostFullScreenRoute) {
        return {type: 'return'};
    }

    if (topmostFullScreenRoute.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
        return {type: 'goBack', route: ROUTES.WORKSPACES_LIST.route};
    }

    let returnAction: NavigationAction = {type: 'return'};

    interceptAnonymousUser(() => {
        const workspacesTabStateFromSessionStorage = getWorkspacesTabStateFromSessionStorage() ?? rootState;
        const lastWorkspacesTabNavigatorRoute = workspacesTabStateFromSessionStorage.routes.findLast((route) => isWorkspacesTabScreenName(route.name));
        // If there is no settings or workspace navigator route, then we should open the settings navigator.
        if (!lastWorkspacesTabNavigatorRoute) {
            returnAction = {type: 'navigate', route: ROUTES.WORKSPACES_LIST.route};
            return;
        }

        let workspacesTabState = lastWorkspacesTabNavigatorRoute.state;
        if (!workspacesTabState && lastWorkspacesTabNavigatorRoute.key) {
            workspacesTabState = getPreservedNavigatorState(lastWorkspacesTabNavigatorRoute.key);
        }

        // If there is a workspace navigator route, then we should open the workspace initial screen as it should be "remembered".
        if (lastWorkspacesTabNavigatorRoute.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
            const params = workspacesTabState?.routes.at(0)?.params as WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.INITIAL];
            // Screens of this navigator should always have policyID
            const policy = getPolicy(params.policyID);
            const shouldShowPolicy = shouldShowPolicyUtil(policy, false, currentUserLogin);
            const isPendingDelete = isPendingDeletePolicy(policy);

            if (!shouldShowPolicy || isPendingDelete) {
                returnAction = {type: 'navigate', route: ROUTES.WORKSPACES_LIST.route};
                return;
            }

            if (params.policyID) {
                const workspaceScreenName = !shouldUseNarrowLayout ? getLastVisitedWorkspaceTabScreen() : SCREENS.WORKSPACE.INITIAL;
                returnAction = {
                    type: 'dispatch',
                    dispatchType: CONST.NAVIGATION.ACTION_TYPE.OPEN_WORKSPACE_SPLIT,
                    payload: {
                        policyID: params.policyID,
                        screenName: workspaceScreenName,
                    },
                };
                return;
            }
            returnAction = {
                type: 'return',
            };
            return;
        }

        returnAction = {type: 'navigate', route: ROUTES.WORKSPACES_LIST.route};
    });
    return returnAction;
};

export default getWorkspaceTabNavigationAction;

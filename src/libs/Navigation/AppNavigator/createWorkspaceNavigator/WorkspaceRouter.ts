import type {ParamListBase, PartialState, RouterConfigOptions, StackNavigationState} from '@react-navigation/native';
import {StackRouter} from '@react-navigation/native';
import {getWorkspacesTabStateFromSessionStorage} from '@libs/Navigation/helpers/lastVisitedTabPathUtils';
import {getPreservedNavigatorState} from '@navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type WorkspaceNavigatorRouterOptions from './types';

/**
 * Builds the WorkspaceNavigator initial state from the saved Workspaces-tab path in sessionStorage —
 * the routes the user had open in the tab before navigating away. Prepends WORKSPACES_LIST when the
 * saved path didn't include it so the back-stack works (swipe back from a workspace returns to the list).
 * Returns `undefined` on native (no sessionStorage), when nothing is saved, or when the parsed
 * state has no WORKSPACE_NAVIGATOR slot.
 */
function buildWorkspaceInitialStateFromSessionStorage(): PartialState<StackNavigationState<ParamListBase>> | undefined {
    const sessionState = getWorkspacesTabStateFromSessionStorage();
    const restoredState = sessionState?.routes?.find((r) => r.name === NAVIGATORS.TAB_NAVIGATOR)?.state?.routes?.find((r) => r.name === NAVIGATORS.WORKSPACE_NAVIGATOR)?.state as
        | PartialState<StackNavigationState<ParamListBase>>
        | undefined;
    if (!restoredState?.routes?.length) {
        return undefined;
    }
    if (restoredState.routes.some((r) => r.name === SCREENS.WORKSPACES_LIST)) {
        return restoredState;
    }
    const routes = [{name: SCREENS.WORKSPACES_LIST}, ...restoredState.routes];
    return {routes, index: routes.length - 1};
}

function WorkspaceRouter(options: WorkspaceNavigatorRouterOptions) {
    const stackRouter = StackRouter(options);

    return {
        ...stackRouter,
        getInitialState(configOptions: RouterConfigOptions) {
            const preservedState = getPreservedNavigatorState(options.parentRoute.key);
            if (preservedState) {
                return preservedState;
            }
            const sessionState = buildWorkspaceInitialStateFromSessionStorage();
            if (sessionState) {
                return stackRouter.getRehydratedState(sessionState, configOptions);
            }
            return stackRouter.getInitialState(configOptions);
        },
    };
}

export default WorkspaceRouter;

import getTopmostBottomTabRoute from '@libs/Navigation/getTopmostBottomTabRoute';
import getTopmostCentralPaneRoute from '@libs/Navigation/getTopmostCentralPaneRoute';
import getTopmostWorkspaceRoute from '@libs/Navigation/getTopmostWorkspaceRoute';
import type {Metainfo} from '@libs/Navigation/linkingConfig/getAdaptedStateFromPath';
import type {NavigationPartialRoute, RootStackParamList, State} from '@libs/Navigation/types';
import shallowCompare from '@libs/ObjectUtils';
import NAVIGATORS from '@src/NAVIGATORS';

type GetPartialStateDiffReturnType = {
    [NAVIGATORS.BOTTOM_TAB_NAVIGATOR]?: NavigationPartialRoute;
    [NAVIGATORS.CENTRAL_PANE_NAVIGATOR]?: NavigationPartialRoute;
    [NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR]?: NavigationPartialRoute;
};

/**
 * This function returns partial additive diff between the two states.
 *
 * Example: Let's start with state A on route /r/123. If the screen is wide we will have a HOME opened on bottom tab and REPORT on central pane.
 * Now let's say we want to navigate to /workspace/345/profile. We will generate state B from this path.
 * State B will have WORKSPACE_INITIAL on the bottom tab and WORKSPACE_PROFILE on the central pane.
 * Now we will generate partial diff between state A and state B. The diff will tell us that we need to push WORKSPACE_INITIAL on the bottom tab and WORKSPACE_PROFILE on the central pane.
 *
 * Then we can generate actions from this diff and dispatch them to the linkTo function.
 *
 * It's named partial diff because we don't cover RHP and LHP navigators yet. In the future we can improve this function to handle all navigators to help us clean and simplify the linkTo function.
 *
 * The partial diff has information which bottom tab, central pane and full screen screens we need to push to go from state to templateState.
 * @param state - Current state.
 * @param templateState - Desired state generated with getAdaptedStateFromPath.
 * @param metainfo - Additional info from getAdaptedStateFromPath function.
 * @returns The screen options object
 */
function getPartialStateDiff(state: State<RootStackParamList>, templateState: State<RootStackParamList>, metainfo: Metainfo): GetPartialStateDiffReturnType {
    const diff: GetPartialStateDiffReturnType = {};

    // If it is mandatory we need to compare both central pane and bottom tab of states.
    if (metainfo.isCentralPaneAndBottomTabMandatory) {
        const stateTopmostBottomTab = getTopmostBottomTabRoute(state);
        const templateStateTopmostBottomTab = getTopmostBottomTabRoute(templateState);

        // Bottom tab navigator
        if (stateTopmostBottomTab && templateStateTopmostBottomTab && stateTopmostBottomTab.name !== templateStateTopmostBottomTab.name) {
            diff[NAVIGATORS.BOTTOM_TAB_NAVIGATOR] = templateStateTopmostBottomTab;
        }

        const stateTopmostCentralPane = getTopmostCentralPaneRoute(state);
        const templateStateTopmostCentralPane = getTopmostCentralPaneRoute(templateState);

        if (
            // If the central pane is only in the template state, it's diff.
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            (!stateTopmostCentralPane && templateStateTopmostCentralPane) ||
            (stateTopmostCentralPane &&
                templateStateTopmostCentralPane &&
                stateTopmostCentralPane.name !== templateStateTopmostCentralPane.name &&
                !shallowCompare(stateTopmostCentralPane.params as Record<string, unknown> | undefined, templateStateTopmostCentralPane.params as Record<string, unknown> | undefined))
        ) {
            // We need to wrap central pane routes in the central pane navigator.
            diff[NAVIGATORS.CENTRAL_PANE_NAVIGATOR] = templateStateTopmostCentralPane;
        }
    }

    // This one is heuristic and may need to be improved if we will be able to navigate from modal screen with full screen in background to another modal screen with full screen in background.
    // For now this simple check is enough.
    if (metainfo.isWorkspaceNavigatorMandatory) {
        const stateTopmostWorkspaceRoute = getTopmostWorkspaceRoute(state);
        const templateStateTopmostWorkspaceRoute = getTopmostWorkspaceRoute(templateState);
        const workspaceNavDiff = templateState.routes.filter((route) => route.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR).at(-1) as NavigationPartialRoute;

        if (
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            (!stateTopmostWorkspaceRoute && templateStateTopmostWorkspaceRoute) ||
            (stateTopmostWorkspaceRoute &&
                templateStateTopmostWorkspaceRoute &&
                (stateTopmostWorkspaceRoute.name !== templateStateTopmostWorkspaceRoute.name ||
                    !shallowCompare(
                        stateTopmostWorkspaceRoute.params as Record<string, unknown> | undefined,
                        templateStateTopmostWorkspaceRoute.params as Record<string, unknown> | undefined,
                    )))
        ) {
            diff[NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR] = workspaceNavDiff;
        }
    }

    return diff;
}

export default getPartialStateDiff;
export type {GetPartialStateDiffReturnType};

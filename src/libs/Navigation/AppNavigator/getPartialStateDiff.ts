import getTopmostBottomTabRoute from '@libs/Navigation/getTopmostBottomTabRoute';
import getTopmostCentralPaneRoute from '@libs/Navigation/getTopmostCentralPaneRoute';
import type {Metainfo} from '@libs/Navigation/linkingConfig/getAdaptedStateFromPath';
import type {NavigationPartialRoute, RootStackParamList, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';

// eslint-disable-next-line @typescript-eslint/ban-types
const shallowCompare = (obj1?: object, obj2?: object) => {
    if (!obj1 && !obj2) {
        return true;
    }
    if (obj1 && obj2) {
        // @ts-expect-error we know that obj1 and obj2 are params of a route.
        return Object.keys(obj1).length === Object.keys(obj2).length && Object.keys(obj1).every((key) => obj1[key] === obj2[key]);
    }
    return false;
};

type GetPartialStateDiffReturnType = {
    [NAVIGATORS.BOTTOM_TAB_NAVIGATOR]?: NavigationPartialRoute;
    [NAVIGATORS.CENTRAL_PANE_NAVIGATOR]?: NavigationPartialRoute;
    [NAVIGATORS.FULL_SCREEN_NAVIGATOR]?: NavigationPartialRoute;
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
                !shallowCompare(stateTopmostCentralPane.params, templateStateTopmostCentralPane.params))
        ) {
            // We need to wrap central pane routes in the central pane navigator.
            diff[NAVIGATORS.CENTRAL_PANE_NAVIGATOR] = templateStateTopmostCentralPane;
        }
    }

    // This one is heuristic and may need to be improved if we will be able to navigate from modal screen with full screen in background to another modal screen with full screen in background.
    // For now this simple check is enough.
    if (metainfo.isFullScreenNavigatorMandatory) {
        const stateTopmostFullScreen = state.routes.filter((route) => route.name === NAVIGATORS.FULL_SCREEN_NAVIGATOR).at(-1);
        const templateStateTopmostFullScreen = templateState.routes.filter((route) => route.name === NAVIGATORS.FULL_SCREEN_NAVIGATOR).at(-1) as NavigationPartialRoute;
        if (!stateTopmostFullScreen && templateStateTopmostFullScreen) {
            diff[NAVIGATORS.FULL_SCREEN_NAVIGATOR] = templateStateTopmostFullScreen;
        }
    }

    return diff;
}

export default getPartialStateDiff;
export type {GetPartialStateDiffReturnType};

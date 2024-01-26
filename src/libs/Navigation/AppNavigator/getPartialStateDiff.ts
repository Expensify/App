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
 * This function returns partial additive diff beteween the two states.
 * The partial diff have information which bottom tab, central pane and full screen screens we need to push to go from state to templateState
 * @param state - Current state.
 * @param templateState - Desired state generated with getAdaptedStateFromPath.
 * @param metainfo - Additional info from getAdaptedStateFromPath funciton.
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

    // This one is heurestic and may need to improved if we will be able to navigate from modal screen with full screen in background to another modal screen with full screen in background.
    // For now this simple check is enought.
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

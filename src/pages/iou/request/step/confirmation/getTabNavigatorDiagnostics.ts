import type {NavigationState} from '@react-navigation/native';
import {navigationRef} from '@libs/Navigation/Navigation';
import type {RootNavigatorParamList, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';

type TabNavigatorDiagnostics = {
    tabNavigatorStateAvailable: boolean;
    tabActiveName: string | undefined;

    /** The nested state of the active tab route (e.g. split navigator routes), if available. */
    activeTabState: NavigationState | undefined;
};

/**
 * Returns diagnostic info about the TAB_NAVIGATOR state: whether the state object
 * is available and the name of the currently active tab route. Used for telemetry
 * to detect cases where the tab state is temporarily missing (e.g. during remounts
 * caused by the slicing optimization in useCustomRootStackNavigatorState).
 */
const TAB_NAVIGATOR_UNAVAILABLE: TabNavigatorDiagnostics = Object.freeze({tabNavigatorStateAvailable: false, tabActiveName: undefined, activeTabState: undefined});

function getTabNavigatorDiagnostics(existingRootState?: NavigationState): TabNavigatorDiagnostics {
    // Same cast pattern used by getTopmostFullScreenRoute, getTopmostReportParams, etc.
    const rootState = (existingRootState ?? navigationRef.getRootState()) as State<RootNavigatorParamList> | undefined;
    if (!rootState) {
        return TAB_NAVIGATOR_UNAVAILABLE;
    }

    const topmostTabNavigatorRoute = rootState.routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    if (!topmostTabNavigatorRoute?.state) {
        return TAB_NAVIGATOR_UNAVAILABLE;
    }

    const index = topmostTabNavigatorRoute.state.index ?? 0;
    const activeRoute = topmostTabNavigatorRoute.state.routes?.at(index);
    const nestedState = activeRoute?.state;
    return {
        tabNavigatorStateAvailable: true,
        tabActiveName: activeRoute?.name,
        activeTabState: nestedState && 'routes' in nestedState ? (nestedState as NavigationState) : undefined,
    };
}

export default getTabNavigatorDiagnostics;

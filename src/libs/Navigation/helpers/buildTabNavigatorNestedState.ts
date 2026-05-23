import type {NavigationState, PartialState} from '@react-navigation/native';
import TAB_SCREENS from '@libs/Navigation/AppNavigator/Navigators/TAB_SCREENS';
import type {NavigationPartialRoute} from '@libs/Navigation/types';

/** One partial route per tab, in the same order as `TAB_SCREENS` (TabRouter expects a stable route list). */
const TAB_NAVIGATOR_ROUTES: NavigationPartialRoute[] = TAB_SCREENS.map((name) => ({name}));

/**
 * Builds the **full tab strip** as a single `PartialState` for the root tab navigator: every tab slot exists, with the
 * active tab filled in from `selectedTabRoute` (name + optional `params` / nested `state`). That mirrors deep-link state,
 * where the navigator is not initialized from a lone `{ screen }` hint.
 *
 * TabRouter can then resolve the focused tab from `index` and `routes` in one shot instead of: mount with partial routes →
 * effect dispatches `NAVIGATE` → with `backBehavior="fullHistory"`, an extra history entry appears.
 */
function buildTabNavigatorNestedState(selectedTabRoute: NavigationPartialRoute): PartialState<NavigationState> {
    const tabIndex = TAB_NAVIGATOR_ROUTES.findIndex((r) => r.name === selectedTabRoute.name);
    // Unknown names fall back to the first tab; callers should pass a valid tab screen from the push payload.
    const index = tabIndex >= 0 ? tabIndex : 0;

    const routes = TAB_NAVIGATOR_ROUTES.map((route, i) => {
        if (i === index) {
            return {
                ...route,
                ...(selectedTabRoute.state ? {state: selectedTabRoute.state} : {}),
                ...(selectedTabRoute.params ? {params: selectedTabRoute.params} : {}),
            };
        }
        // Non-focused tabs stay minimal `{ name }` entries so the tab list length matches `TAB_SCREENS`.
        return {...route};
    });

    return {routes, index} as PartialState<NavigationState>;
}

export default buildTabNavigatorNestedState;

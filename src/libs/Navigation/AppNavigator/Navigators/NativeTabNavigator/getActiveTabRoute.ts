import type {NavigationState, PartialState} from '@react-navigation/native';

/**
 * The focused TAB_NAVIGATOR route, read from the partial cold-start state too so a restored non-root screen doesn't flash the bar.
 * A partial state without an index focuses the first tab, as in TabRouter.
 */
function getActiveTabRoute(tabState: NavigationState | PartialState<NavigationState> | undefined) {
    return tabState?.routes.at(tabState.index ?? 0);
}

export default getActiveTabRoute;

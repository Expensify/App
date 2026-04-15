import type {NavigationState, PartialState} from '@react-navigation/native';
import findFocusedRouteWithOnyxTabGuard from '@libs/Navigation/helpers/findFocusedRouteWithOnyxTabGuard';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import type {Route} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';
import findMatchingDynamicSuffix from './findMatchingDynamicSuffix';
import getPathWithoutDynamicSuffix from './getPathWithoutDynamicSuffix';
import isDynamicRouteScreen from './isDynamicRouteScreen';

/**
 * Recursively inserts `stateToInsert` below `accumulatedState` in the
 * navigation tree. At each level, if the first route names match we recurse
 * deeper; otherwise the route from `stateToInsert` is prepended and the index
 * is shifted so the previously focused route stays focused.
 *
 * @param accumulatedState - The accumulated state to insert the new state below.
 * @param stateToInsert - The state to insert below the accumulated state.
 * @returns The new state with the new state inserted below the accumulated state.
 *
 * @private - Internal helper. Do not export or use outside this file.
 */
function insertStateBelow(accumulatedState: PartialState<NavigationState>, stateToInsert: PartialState<NavigationState>): PartialState<NavigationState> {
    const routeToInsert = stateToInsert.routes.at(0);
    if (!routeToInsert) {
        return accumulatedState;
    }

    const existingRoute = accumulatedState.routes.at(0);
    if (!existingRoute) {
        return stateToInsert;
    }

    // Same navigator at this level - recurse deeper to find the divergence point.
    if (routeToInsert.name === existingRoute.name) {
        const existingNestedState = existingRoute.state as PartialState<NavigationState> | undefined;
        const nestedStateToInsert = routeToInsert.state as PartialState<NavigationState> | undefined;

        if (existingNestedState && nestedStateToInsert) {
            const mergedNestedState = insertStateBelow(existingNestedState, nestedStateToInsert);
            const updatedRoute = {...existingRoute, state: mergedNestedState};
            const updatedRoutes = [updatedRoute, ...accumulatedState.routes.slice(1)];
            return {
                ...accumulatedState,
                routes: updatedRoutes,
                index: accumulatedState.index ?? accumulatedState.routes.length - 1,
            } as PartialState<NavigationState>;
        }

        return accumulatedState;
    }

    // Different navigator - this is the divergence point.
    // Prepend the new route and shift the index so the previously focused route stays focused.
    const updatedRoutes = [routeToInsert, ...accumulatedState.routes];
    return {
        ...accumulatedState,
        routes: updatedRoutes,
        index: (accumulatedState.index ?? accumulatedState.routes.length - 1) + 1,
    } as PartialState<NavigationState>;
}

/**
 * Iteratively strips dynamic suffixes from a URL and inserts each intermediate
 * navigation state below the accumulated state. This restores the full
 * screen chain so that back-navigation works correctly after a page refresh
 * when the URL contains stacked dynamic suffixes.
 *
 * @param state - Initial navigation state (from getStateFromPath for the full URL)
 * @param focusedRoutePath - The full URL path of the currently focused route
 * @returns Navigation state with all intermediate screens present
 */
function getDynamicRouteAdaptedState(state: PartialState<NavigationState>, focusedRoutePath: string): PartialState<NavigationState> {
    let accumulatedState = state;
    let currentPath = focusedRoutePath;

    let newFocused = findFocusedRouteWithOnyxTabGuard(accumulatedState);
    do {
        const suffixMatch = findMatchingDynamicSuffix(currentPath);
        if (!suffixMatch) {
            break;
        }

        const basePath = getPathWithoutDynamicSuffix(currentPath, suffixMatch.actualSuffix, suffixMatch.pattern);
        if (!basePath || basePath === currentPath) {
            break;
        }

        const baseState = getStateFromPath(basePath as Route);
        if (!baseState) {
            break;
        }

        accumulatedState = insertStateBelow(accumulatedState, baseState);
        currentPath = basePath;

        newFocused = findFocusedRouteWithOnyxTabGuard(baseState);
    } while (!!newFocused && isDynamicRouteScreen(newFocused.name as Screen));

    return accumulatedState;
}

export default getDynamicRouteAdaptedState;

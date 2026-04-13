import type {NavigationState, PartialState} from '@react-navigation/native';
import findFocusedRouteWithOnyxTabGuard from '@libs/Navigation/helpers/findFocusedRouteWithOnyxTabGuard';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import type {Route} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';
import findMatchingDynamicSuffix from './findMatchingDynamicSuffix';
import getPathWithoutDynamicSuffix from './getPathWithoutDynamicSuffix';
import isDynamicRouteScreen from './isDynamicRouteScreen';

/**
 * Recursively merges `stateToInsert` behind (before) `accumulatedState` in the
 * navigation tree. At each level, if the first route names match we recurse
 * deeper; otherwise the route from `stateToInsert` is prepended and the index
 * is shifted so the previously focused route stays focused.
 */
function mergeStateBehind(accumulatedState: PartialState<NavigationState>, stateToInsert: PartialState<NavigationState>): PartialState<NavigationState> {
    const insertRoute = stateToInsert.routes.at(0);
    if (!insertRoute) {
        return accumulatedState;
    }

    const firstAccumulatedRoute = accumulatedState.routes.at(0);
    if (!firstAccumulatedRoute) {
        return stateToInsert;
    }

    if (insertRoute.name === firstAccumulatedRoute.name) {
        const accNestedState = firstAccumulatedRoute.state as PartialState<NavigationState> | undefined;
        const insNestedState = insertRoute.state as PartialState<NavigationState> | undefined;

        if (accNestedState && insNestedState) {
            const mergedNested = mergeStateBehind(accNestedState, insNestedState);
            const updatedRoute = {...firstAccumulatedRoute, state: mergedNested};
            const updatedRoutes = [updatedRoute, ...accumulatedState.routes.slice(1)];
            return {
                ...accumulatedState,
                routes: updatedRoutes,
                index: accumulatedState.index ?? accumulatedState.routes.length - 1,
            } as PartialState<NavigationState>;
        }

        return accumulatedState;
    }

    const updatedRoutes = [insertRoute, ...accumulatedState.routes];
    return {
        ...accumulatedState,
        routes: updatedRoutes,
        index: (accumulatedState.index ?? accumulatedState.routes.length - 1) + 1,
    } as PartialState<NavigationState>;
}

/**
 * Iteratively strips dynamic suffixes from a URL and merges each intermediate
 * navigation state into the accumulated state. This reconstructs the full
 * screen chain so that back-navigation works correctly after a page refresh
 * when the URL contains stacked dynamic suffixes.
 *
 * @param state - Initial navigation state (from getStateFromPath for the full URL)
 * @param focusedRoutePath - The full URL path of the currently focused route
 * @returns Navigation state with all intermediate screens present
 */
function buildDynamicStateChain(state: PartialState<NavigationState>, focusedRoutePath: string): PartialState<NavigationState> {
    let accumulatedState = state;
    let currentPath = focusedRoutePath;

    let shouldContinue = true;
    do {
        const suffixMatch = findMatchingDynamicSuffix(currentPath);
        if (!suffixMatch) {
            break;
        }

        const basePath = getPathWithoutDynamicSuffix(currentPath, suffixMatch.actualSuffix, suffixMatch.pattern);
        if (!basePath) {
            break;
        }

        const baseState = getStateFromPath(basePath as Route);
        if (!baseState) {
            break;
        }

        accumulatedState = mergeStateBehind(accumulatedState, baseState);
        currentPath = basePath;

        const newFocused = findFocusedRouteWithOnyxTabGuard(baseState);
        shouldContinue = !!newFocused && isDynamicRouteScreen(newFocused.name as Screen);
    } while (shouldContinue);

    return accumulatedState;
}

export default buildDynamicStateChain;

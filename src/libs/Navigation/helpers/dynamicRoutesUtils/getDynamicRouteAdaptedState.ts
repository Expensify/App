import findFocusedRouteWithOnyxTabGuard from '@libs/Navigation/helpers/findFocusedRouteWithOnyxTabGuard';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';

import type {Route} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

import type {DynamicSuffixMatch} from './findAllMatchingDynamicSuffixes';

import findAllMatchingDynamicSuffixes from './findAllMatchingDynamicSuffixes';
import getPathWithoutDynamicSuffix from './getPathWithoutDynamicSuffix';
import insertStateBelow from './insertStateBelow';
import isDynamicRouteScreen from './isDynamicRouteScreen';

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
        // Iterate all candidates so a false-positive greedy first match (e.g. a tag named
        // "gl-code" coinciding with a static suffix) doesn't produce a wrong base state.
        let resolvedMatch: DynamicSuffixMatch | undefined;
        let resolvedBasePath: Route | undefined;
        let resolvedBaseState: PartialState<NavigationState> | undefined;
        const allSuffixMatches = findAllMatchingDynamicSuffixes(currentPath);

        for (const candidate of allSuffixMatches) {
            const candidateBasePath = getPathWithoutDynamicSuffix(candidate.pathUsedForMatching, candidate.actualSuffix, candidate.pattern);
            if (!candidateBasePath || candidateBasePath === currentPath) {
                continue;
            }
            const candidateBaseState = getStateFromPath(candidateBasePath as Route);
            const lastRoute = candidateBaseState?.routes?.at(-1);

            if (!candidateBaseState || !lastRoute || lastRoute.name === SCREENS.NOT_FOUND) {
                continue;
            }
            resolvedMatch = candidate;
            resolvedBasePath = candidateBasePath;
            resolvedBaseState = candidateBaseState;
            break;
        }

        if (!resolvedMatch || !resolvedBasePath || !resolvedBaseState) {
            break;
        }

        accumulatedState = insertStateBelow(accumulatedState, resolvedBaseState);
        currentPath = resolvedBasePath;

        newFocused = findFocusedRouteWithOnyxTabGuard(resolvedBaseState);
    } while (!!newFocused && isDynamicRouteScreen(newFocused.name as Screen));

    return accumulatedState;
}

export default getDynamicRouteAdaptedState;

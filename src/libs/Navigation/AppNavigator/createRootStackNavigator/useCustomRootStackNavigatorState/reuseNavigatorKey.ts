import type { ParamListBase, StackNavigationState } from '@react-navigation/native';
import { screensWithEnteringAnimation } from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import { isFullScreenName } from '@libs/Navigation/helpers/isNavigatorName';






type StateRoutes = StackNavigationState<ParamListBase>['routes'];

/**
 * Remaps the key of a fullscreen navigator route in `routesToRender` to the canonical (first) occurrence key
 * of that navigator name found in the full navigation state.
 *
 * This allows React to reuse the already-mounted navigator component instead of remounting it,
 * avoiding expensive teardown/setup cycles. The real navigation state is left untouched, so
 * browser history still works correctly (the state always has unique keys).
 *
 * Example: state=[RSN-key1, WSN-key2, RSN-key3], routesToRender=[WSN-key2, RSN-key3]
 *   → RSN-kopey3 is remapped to RSN-key1 (the first RSN in state, which is already mounted)
 *   → React sees [WSN-key2, RSN-key1] in both old and new render → reuses RSN-key1 component
 */
function reuseNavigatorKey(routesToRender: StateRoutes, fullState: StackNavigationState<ParamListBase>): StateRoutes {
    debugger;
    return routesToRender.map((route) => {
        if (!isFullScreenName(route.name)) {
            return route;
        }

        const firstOccurrence = fullState.routes.find((r) => r.name === route.name);
        if (!firstOccurrence) {
            return route;
        }

        const canonicalKey = firstOccurrence.key;
        const shouldRemap = canonicalKey !== route.key && !routesToRender.some((r) => r.key === canonicalKey);

        if (!shouldRemap) {
            return route;
        }

        // Transfer animation marker from new key to canonical key so slide-in animation fires correctly.
        if (screensWithEnteringAnimation.has(route.key)) {
            screensWithEnteringAnimation.delete(route.key);
            screensWithEnteringAnimation.add(canonicalKey);
        }

        return {...firstOccurrence, params: {...firstOccurrence.params, ...route.params}};
    });
}

function cleanNavigationState(state) {
    function processNavigator(navigatorState) {
        if (!navigatorState?.routes) {
            return navigatorState;
        }

        const seenNames = new Map(); // name -> canonicalKey
        const keyRemap = new Map(); // oldKey -> canonicalKey
        const cleanedRoutesReversed = [];

        // 1️⃣ iterujemy OD KOŃCA (nowsze mają priorytet)
        for (let i = navigatorState.routes.length - 1; i >= 0; i--) {
            const route = navigatorState.routes[i];

            let nextRoute = route;

            // rekurencja w dół
            if (route.state) {
                nextRoute = {
                    ...route,
                    state: processNavigator(route.state),
                };
            }

            const canonicalKey = seenNames.get(route.name);

            if (canonicalKey) {
                // duplikat → zachowujemy nowszy route,
                // ale mapujemy key na wcześniejszy
                keyRemap.set(route.key, canonicalKey);

                cleanedRoutesReversed.push({
                    ...nextRoute,
                    key: canonicalKey,
                });
            } else {
                // pierwsze wystąpienie (od końca)
                seenNames.set(route.name, route.key);
                cleanedRoutesReversed.push(nextRoute);
            }
        }

        const cleanedRoutes = cleanedRoutesReversed.reverse();
        const validKeys = new Set(cleanedRoutes.map((r) => r.key));

        // 2️⃣ naprawa history
        let cleanedHistory = navigatorState.history;
        if (Array.isArray(navigatorState.history)) {
            cleanedHistory = navigatorState.history.map((key) => keyRemap.get(key) ?? key).filter((key) => validKeys.has(key));
        }

        // 3️⃣ naprawa index
        const cleanedIndex = Math.min(navigatorState.index ?? 0, Math.max(cleanedRoutes.length - 1, 0));

        return {
            ...navigatorState,
            routes: cleanedRoutes,
            history: cleanedHistory,
            index: cleanedIndex,
        };
    }

    return processNavigator(state);
}

export {reuseNavigatorKey,cleanNavigationState};

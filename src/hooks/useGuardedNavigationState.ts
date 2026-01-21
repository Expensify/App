import type {NavigationState} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import {useMemo} from 'react';
import Log from '@libs/Log';
import {createGuardContext, evaluateGuards} from '@libs/Navigation/guards';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Hook that generates navigation state from a path while checking navigation guards.
 */
function useGuardedNavigationState(
    path: string | null,
    options: Parameters<typeof getAdaptedStateFromPath>[1],
    shouldReplacePathInNestedState?: boolean,
): ReturnType<typeof getAdaptedStateFromPath> {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    return useMemo(() => {
        if (!path) {
            return undefined;
        }

        // Generate the target state from the path
        const adaptedState = getAdaptedStateFromPath(path, options, shouldReplacePathInNestedState);

        if (!adaptedState) {
            return undefined;
        }

        // Find what screen we're trying to navigate to
        const focusedRoute = findFocusedRoute(adaptedState as unknown as NavigationState);
        if (!focusedRoute) {
            return adaptedState;
        }

        // Create an empty initial state representing app startup (before any navigation)
        const emptyState: NavigationState = {
            key: 'initial',
            index: 0,
            routeNames: [],
            routes: [],
            type: 'root',
            stale: false,
        };

        // Create a navigation action representing the navigation to adaptedState
        const navigationAction = {
            type: 'NAVIGATE' as const,
            payload: {
                name: focusedRoute.name,
                params: focusedRoute.params,
            },
        };

        // Create guard context with current Onyx data from hooks
        const guardContext = createGuardContext({
            account,
            onboarding,
            session,
        });

        // Evaluate guards: "If we navigate from empty state to adaptedState, would guards block it?"
        const result = evaluateGuards(emptyState, navigationAction, guardContext);

        if (result.type === 'REDIRECT') {
            Log.info('[useGuardedNavigationState] Guard redirecting to', false, {
                originalPath: path,
                targetRoute: focusedRoute.name,
                redirectRoute: result.route,
            });
            // Return state for redirect route instead
            return getAdaptedStateFromPath(result.route, options, shouldReplacePathInNestedState);
        }

        if (result.type === 'BLOCK') {
            Log.info('[useGuardedNavigationState] Guard blocked navigation', false, {
                originalPath: path,
                targetRoute: focusedRoute.name,
                reason: result.reason,
            });
            // If blocked without a specific redirect, return undefined (no initial state)
            return undefined;
        }

        // No guards triggered, return the original adapted state
        return adaptedState;
    }, [path, options, shouldReplacePathInNestedState, account, onboarding, session]);
}

export default useGuardedNavigationState;

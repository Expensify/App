import isEqual from 'lodash/isEqual';
import {useEffect, useRef} from 'react';
import type {CustomEffectsHookProps} from '@libs/Navigation/PlatformStackNavigation/types';

/**
 * When buildOptimizedRoutes remaps a new route to reuse an existing navigator component,
 * the component keeps its old internal navigation state but receives new parentRoute.params
 * pointing to a different screen. This hook detects that change and dispatches a navigate
 * action within the split navigator so the correct screen is shown.
 *
 * Without this, clicking a sub-tab (e.g. wallet) while already inside a split navigator
 * would change the URL but leave the displayed screen unchanged.
 */
function useNavigateOnParamsChange({navigation, parentRoute, state}: CustomEffectsHookProps) {
    // Initialized to undefined (not the current params) so that the first render also checks
    // whether the navigator's initial state matches the target screen. This is required for
    // freshly-mounted navigators whose getInitialState may not navigate to the correct screen.
    const lastHandledParamsRef = useRef<Record<string, unknown> | undefined>(undefined);

    // No dependency array — runs after every render.
    // The ref guard ensures we only act when params actually change.
    useEffect(() => {
        const currentParams = parentRoute?.params;

        if (lastHandledParamsRef.current === currentParams) {
            return;
        }

        lastHandledParamsRef.current = currentParams;

        const screenToNavigate = currentParams && 'screen' in currentParams ? (currentParams.screen as string) : undefined;

        if (!screenToNavigate) {
            return;
        }

        const screenParams = currentParams && 'params' in currentParams ? (currentParams.params as Record<string, unknown>) : undefined;

        // Already showing the correct screen with the same params — nothing to do.
        const lastRoute = state.routes.at(-1);
        if (lastRoute?.name === screenToNavigate && isEqual(lastRoute?.params, screenParams)) {
            return;
        }

        navigation.navigate(screenToNavigate, screenParams);
    });
}

export default useNavigateOnParamsChange;

import {useEffect, useRef} from 'react';
import type {CustomEffectsHookProps} from '@libs/Navigation/PlatformStackNavigation/types';

/**
 * When reuseNavigatorKey remaps a new route to reuse an existing navigator component,
 * the component keeps its old internal navigation state but receives new parentRoute.params
 * pointing to a different screen. This hook detects that change and dispatches a navigate
 * action within the split navigator so the correct screen is shown.
 *
 * Without this, clicking a sub-tab (e.g. wallet) while already inside a split navigator
 * would change the URL but leave the displayed screen unchanged.
 */
function useNavigateOnParamsChange({navigation, parentRoute, state}: CustomEffectsHookProps) {
    // Initialize with current params so we don't navigate on the first mount.
    const lastHandledParamsRef = useRef(parentRoute?.params);

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

        // Already showing the correct screen — nothing to do.
        const lastRoute = state.routes.at(-1);
        if (lastRoute?.name === screenToNavigate) {
            return;
        }

        const screenParams = currentParams && 'params' in currentParams ? (currentParams.params as Record<string, unknown>) : undefined;

        navigation.navigate(screenToNavigate, screenParams);
    });
}

export default useNavigateOnParamsChange;

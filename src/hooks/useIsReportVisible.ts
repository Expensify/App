import NAVIGATORS from '@src/NAVIGATORS';

import {useIsFocused} from '@react-navigation/native';
import {useState} from 'react';

import useRootNavigationState from './useRootNavigationState';

/**
 * An RHP sits beside a wide pane rather than over it, so only another tab covers one outright.
 * Tabs switch inside the root's tab navigator, so which one this screen belongs to shows only while it holds focus.
 * Callers pass the narrow flag that applies to them: `shouldUseNarrowLayoutIgnoringWideRHP` where the screen cannot itself become a wide RHP.
 */
function useIsReportVisible(shouldUseNarrowLayout: boolean): boolean {
    const isFocused = useIsFocused();
    const isRHPTopmost = useRootNavigationState((state) => state?.routes?.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
    const activeTabRouteKey = useRootNavigationState((state) => {
        // Derived from the subscribed state rather than the navigation ref, which errors before the container is ready.
        const tabNavigatorState = state?.routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR)?.state;
        return tabNavigatorState?.routes?.at(tabNavigatorState.index ?? 0)?.key;
    });

    // Seeded only when the screen mounts focused, since a screen that first renders in a background tab would otherwise adopt that tab's key.
    const [ownTabRouteKey, setOwnTabRouteKey] = useState(() => (isFocused ? activeTabRouteKey : undefined));

    if (isFocused && ownTabRouteKey !== activeTabRouteKey) {
        setOwnTabRouteKey(activeTabRouteKey);
    }

    if (shouldUseNarrowLayout) {
        return isFocused;
    }
    return isFocused || (ownTabRouteKey !== undefined && isRHPTopmost && ownTabRouteKey === activeTabRouteKey);
}

export default useIsReportVisible;

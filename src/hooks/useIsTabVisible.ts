/**
 * Tells whether a tab's root screen can be seen, so data fetched for it is not wasted. An RHP hides the screen on a
 * narrow layout but opens beside it on a wide one.
 */
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import getActiveTabName from '@libs/Navigation/helpers/getActiveTabName';
import isSideModalNavigator from '@libs/Navigation/helpers/isSideModalNavigator';

import NAVIGATORS from '@src/NAVIGATORS';

import {useIsFocused} from '@react-navigation/native';
import {useSyncExternalStore} from 'react';
import {Dimensions} from 'react-native';

import useRootNavigationState from './useRootNavigationState';

function subscribeToDimensions(onChange: () => void) {
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription.remove();
}

/**
 * Returns true when the root screen of `tabName` is on screen. It stays true under an RHP on a wide layout, where
 * `useIsFocused()` turns false although the screen is still visible beside the pane. Any other root screen above the
 * tab, such as a fullscreen, hides it.
 */
function useIsTabVisible(tabName: string): boolean {
    const isScreenFocused = useIsFocused();
    const isTabActiveWithOnlyRHPAbove = useRootNavigationState((state) => {
        const routes = state?.routes ?? [];
        const tabNavigatorIndex = routes.findLastIndex((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
        if (tabNavigatorIndex === -1 || getActiveTabName(routes.at(tabNavigatorIndex)) !== tabName) {
            return false;
        }
        return routes.slice(tabNavigatorIndex + 1).every((route) => isSideModalNavigator(route.name));
    });
    // A boolean snapshot instead of `useResponsiveLayout`, so the screen re-renders only when the layout crosses the breakpoint and not on every resize event.
    const isNarrowLayout = useSyncExternalStore(subscribeToDimensions, getIsNarrowLayout);

    return isScreenFocused || (!isNarrowLayout && isTabActiveWithOnlyRHPAbove);
}

export default useIsTabVisible;

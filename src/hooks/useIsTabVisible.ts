/**
 * Tells whether a tab's root screen can be seen, so data fetched for it is not wasted. An RHP hides the screen on a
 * narrow layout but opens beside it on a wide one.
 */
import getIsNarrowLayout from '@libs/getIsNarrowLayout';

import {useIsFocused} from '@react-navigation/native';
import {useSyncExternalStore} from 'react';
import {Dimensions} from 'react-native';

import useIsTabFocused from './useIsTabFocused';

function subscribeToDimensions(onChange: () => void) {
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription.remove();
}

/**
 * Returns true when the root screen of `tabName` is on screen. It stays true under an RHP on a wide layout, where
 * `useIsFocused()` turns false although the screen is still visible beside the pane.
 */
function useIsTabVisible(tabName: string): boolean {
    const isScreenFocused = useIsFocused();
    const isTabFocused = useIsTabFocused(tabName);
    // A boolean snapshot instead of `useResponsiveLayout`, so the screen re-renders only when the layout crosses the breakpoint and not on every resize event.
    const isNarrowLayout = useSyncExternalStore(subscribeToDimensions, getIsNarrowLayout);

    return isScreenFocused || (!isNarrowLayout && isTabFocused);
}

export default useIsTabVisible;

/**
 * Disables the parent stack's swipe-back gesture while a tab root screen is focused. It renders nothing, so the
 * focused-route subscription re-renders only this component instead of the whole tab navigator on every navigation
 * into or out of a tab root, e.g. when the Search Router opens.
 */
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import SCREENS from '@src/SCREENS';

import {findFocusedRoute, useNavigation, useNavigationState} from '@react-navigation/native';
import {useEffect} from 'react';

/**
 * Root-level tab screens where the swipe-back gesture should be disabled.
 * Swiping from these screens would pop the entire TAB_NAVIGATOR, which feels wrong.
 * WORKSPACE.INITIAL is intentionally excluded, since swiping back from it returns to the workspace list.
 */
const TAB_ROOT_SCREENS_WITHOUT_GESTURE = new Set<string>([SCREENS.HOME, SCREENS.INBOX, SCREENS.SEARCH.ROOT, SCREENS.INSIGHTS, SCREENS.SETTINGS.ROOT]);

function TabRootGestureController() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const navigation = useNavigation();
    const parentNavigation = navigation.getParent();
    const isFocusedRouteTabRoot = useNavigationState((state) => TAB_ROOT_SCREENS_WITHOUT_GESTURE.has(findFocusedRoute(state)?.name ?? ''));

    useEffect(() => {
        if (!shouldUseNarrowLayout || !parentNavigation) {
            return;
        }
        parentNavigation.setOptions({gestureEnabled: !isFocusedRouteTabRoot});
    }, [isFocusedRouteTabRoot, shouldUseNarrowLayout, parentNavigation]);

    return null;
}

export default TabRootGestureController;

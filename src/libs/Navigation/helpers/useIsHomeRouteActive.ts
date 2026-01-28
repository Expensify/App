import {findFocusedRoute, useNavigationState} from '@react-navigation/native';
import useRootNavigationState from '@hooks/useRootNavigationState';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/**
 * Determines if the current route is the Home route/screen
 */
function useIsHomeRouteActive(isNarrowLayout: boolean) {
    const focusedRoute = useNavigationState(findFocusedRoute);
    const navigationState = useRootNavigationState((x) => x);

    if (isNarrowLayout) {
        return focusedRoute?.name === SCREENS.INBOX;
    }

    // On full width screens HOME is always a sidebar to the Reports Screen
    const isSplit = navigationState?.routes.at(-1)?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR;
    const isReport = focusedRoute?.name === SCREENS.REPORT;
    return isSplit && isReport;
}

export default useIsHomeRouteActive;

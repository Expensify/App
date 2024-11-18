import type {NavigationPartialRoute} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

// Determine if we should convert the report route from fullscreen to rhp version or the other way around.
// It's necessary to stay in RHP if we are in RHP report or in fullscreen if we are in fullscreen report.
function shouldConvertReportPath(currentFocusedRoute: NavigationPartialRoute, focusedRouteFromPath: NavigationPartialRoute) {
    // @TODO: Navigating from search central pane could be handled with explicit convert: false option. We would need to add it as option to linkTo.
    if (focusedRouteFromPath.name === SCREENS.REPORT && (currentFocusedRoute.name === SCREENS.SEARCH.REPORT_RHP || currentFocusedRoute.name === SCREENS.SEARCH.CENTRAL_PANE)) {
        return true;
    }

    if (focusedRouteFromPath.name === SCREENS.SEARCH.REPORT_RHP && currentFocusedRoute.name === SCREENS.REPORT) {
        return true;
    }
    return false;
}

export default shouldConvertReportPath;

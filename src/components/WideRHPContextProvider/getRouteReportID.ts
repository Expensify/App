import type {NavigationRoute} from '@libs/Navigation/types';

/** Reads the reportID param of a route, which is the key of the per-report RHP width hints. */
function getRouteReportID(route: NavigationRoute): string | undefined {
    if (route.params && 'reportID' in route.params && typeof route.params.reportID === 'string') {
        return route.params.reportID;
    }
    return undefined;
}

export default getRouteReportID;

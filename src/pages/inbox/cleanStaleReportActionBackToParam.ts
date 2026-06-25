import type {NavigationState} from '@react-navigation/native';
import {CommonActions} from '@react-navigation/native';
import navigationRef from '@libs/Navigation/navigationRef';

/**
 * Cleans stale reportActionID from `backTo` params on sibling routes.
 *
 * When a linked report action is removed (e.g. REPORT_PREVIEW nulled after
 * moving an IOU to a workspace), the current route's reportActionID is cleared
 * by LinkedActionNotFoundGuard.  However, sibling screens that were navigated
 * to FROM this report still carry a `backTo` URL encoding the old
 * reportActionID.  Pressing back on those screens would navigate to the stale
 * deep-link, causing a "not here" page.  This function patches those params.
 */
function cleanStaleReportActionBackToParam(reportID: string, reportActionID: string) {
    const rootState = navigationRef.current?.getRootState();
    if (!rootState) {
        return;
    }

    const staleSegment = `r/${reportID}/${reportActionID}`;
    const cleanSegment = `r/${reportID}`;
    const stalePattern = new RegExp(`${staleSegment}(?=[?/]|$)`);

    function walk(routes: NavigationState['routes'], navigatorKey?: string) {
        for (const route of routes) {
            const backTo = (route.params as Record<string, unknown> | undefined)?.backTo;
            if (typeof backTo === 'string' && stalePattern.test(backTo)) {
                navigationRef.current?.dispatch({
                    ...CommonActions.setParams({backTo: backTo.replace(stalePattern, cleanSegment)}),
                    source: route.key,
                    ...(navigatorKey && {target: navigatorKey}),
                });
            }
            if (route.state?.routes) {
                walk(route.state.routes as NavigationState['routes'], (route.state as NavigationState).key);
            }
        }
    }

    walk(rootState.routes, rootState.key);
}

export default cleanStaleReportActionBackToParam;

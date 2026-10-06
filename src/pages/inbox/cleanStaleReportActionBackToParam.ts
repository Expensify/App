import navigationRef from '@libs/Navigation/navigationRef';

import type {Route} from '@react-navigation/native';

import {CommonActions} from '@react-navigation/native';

type RouteView = {
    key?: string;
    params?: Route<string>['params'];
    state?: {
        key?: string;
        routes: readonly RouteView[];
    };
};

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

    function walk(routes: readonly RouteView[], navigatorKey?: string) {
        for (const route of routes) {
            const backTo = route.params && 'backTo' in route.params ? route.params.backTo : undefined;
            if (route.key && typeof backTo === 'string' && stalePattern.test(backTo)) {
                navigationRef.current?.dispatch({
                    ...CommonActions.setParams({backTo: backTo.replace(stalePattern, cleanSegment)}),
                    source: route.key,
                    ...(navigatorKey && {target: navigatorKey}),
                });
            }
            if (route.state?.routes) {
                walk(route.state.routes, route.state.key);
            }
        }
    }

    walk(rootState.routes, rootState.key);
}

export default cleanStaleReportActionBackToParam;

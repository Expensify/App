import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {isRecord} from '@libs/ObjectUtils';

import replaceReportIDInPath from './replaceReportIDInPath';

type ReportRouteState = {
    key?: string;
    routes: ReadonlyArray<{key?: string; params?: unknown; state?: ReportRouteState}>;
};

function redirectRoutes(state: ReportRouteState, fromReportID: string, toReportID: string) {
    for (const route of state.routes) {
        const params = isRecord(route.params) ? route.params : undefined;
        const updatedParams: {reportID?: string; backTo?: string} = {};
        if (params?.reportID === fromReportID) {
            updatedParams.reportID = toReportID;
        }
        if (typeof params?.backTo === 'string') {
            const updatedBackTo = replaceReportIDInPath(params.backTo, fromReportID, toReportID);
            if (updatedBackTo !== params.backTo) {
                updatedParams.backTo = updatedBackTo;
            }
        }
        if (route.key && Object.keys(updatedParams).length > 0) {
            // Target the owning navigator so background routes update while a details modal is focused.
            Navigation.setParams(updatedParams, route.key, state.key);
        }
        if (route.state) {
            redirectRoutes(route.state, fromReportID, toReportID);
        }
    }
}

/** Remap every report route, including details and the screen underneath, before deleting an optimistic report. */
function redirectReplacedReport(fromReportID: string, toReportID: string) {
    if (!navigationRef.isReady() || fromReportID === toReportID) {
        return;
    }
    const state = navigationRef.getRootState();
    if (state) {
        redirectRoutes(state, fromReportID, toReportID);
    }
}

export default redirectReplacedReport;

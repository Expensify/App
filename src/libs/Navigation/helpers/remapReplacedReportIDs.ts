import type {RootStackNavigatorAction} from '@libs/Navigation/AppNavigator/createRootStackNavigator/types';
import {isRecord} from '@libs/ObjectUtils';

import CONST from '@src/CONST';

import replaceReportIDInPath from './replaceReportIDInPath';
import {getReportReplacements, resolveReplacementReportID} from './reportReplacementMapping';

type ReportNavigationState = {routes: ReadonlyArray<{params?: unknown; path?: string; state?: unknown}>};

function isReportNavigationState(state: unknown): state is ReportNavigationState {
    return isRecord(state) && Array.isArray(state.routes);
}

function remapPath(path: string): string {
    let updatedPath = path;
    for (const [fromReportID] of getReportReplacements()) {
        updatedPath = replaceReportIDInPath(updatedPath, fromReportID, resolveReplacementReportID(fromReportID));
    }
    return updatedPath;
}

/** Repair a saved history entry without mutating it or changing route keys, focus, or stack order. */
function remapReplacedReportIDsInState<S extends ReportNavigationState>(state: S): S {
    let hasChanges = false;
    const routes = state.routes.map((route) => {
        const params = isRecord(route.params) ? route.params : undefined;
        let updatedParams = params;
        if (typeof params?.reportID === 'string') {
            const reportID = resolveReplacementReportID(params.reportID);
            if (reportID !== params.reportID) {
                updatedParams = {...updatedParams, reportID};
            }
        }
        if (typeof params?.backTo === 'string') {
            const backTo = remapPath(params.backTo);
            if (backTo !== params.backTo) {
                updatedParams = {...updatedParams, backTo};
            }
        }
        const nestedState = isReportNavigationState(route.state) ? remapReplacedReportIDsInState(route.state) : route.state;
        const path = typeof route.path === 'string' ? remapPath(route.path) : route.path;
        if (updatedParams === params && nestedState === route.state && path === route.path) {
            return route;
        }
        hasChanges = true;
        return {
            ...route,
            ...(updatedParams !== params ? {params: updatedParams} : {}),
            ...(nestedState !== route.state ? {state: nestedState} : {}),
            ...(path !== route.path ? {path} : {}),
        };
    });
    return hasChanges ? {...state, routes} : state;
}

/** Browser Back/Forward can RESET to a saved tree which was not mounted when the report was replaced. */
function remapReplacedReportIDs(action: RootStackNavigatorAction): RootStackNavigatorAction {
    if (action.type !== CONST.NAVIGATION.ACTION_TYPE.RESET || getReportReplacements().size === 0 || !isReportNavigationState(action.payload)) {
        return action;
    }
    const payload = remapReplacedReportIDsInState(action.payload);
    return payload === action.payload ? action : {...action, payload};
}

export default remapReplacedReportIDs;

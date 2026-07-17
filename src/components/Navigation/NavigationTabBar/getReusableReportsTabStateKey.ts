import {getTabState} from '@libs/Navigation/helpers/tabNavigatorUtils';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function getStringParam(params: unknown, key: string): string | undefined {
    if (!isRecord(params)) {
        return undefined;
    }
    const value = params[key];
    return typeof value === 'string' ? value : undefined;
}

function getReusableReportsTabStateKey(
    rootState: NavigationState | PartialState<NavigationState> | undefined,
    reportID: string | undefined,
    reportActionID: string | undefined,
    doesReportActionExist: boolean | undefined,
): string | undefined {
    if (!rootState || !reportID || (reportActionID && !doesReportActionExist)) {
        return undefined;
    }

    const tabNavigatorRoute = rootState.routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    const tabState = getTabState(tabNavigatorRoute);
    const reportsSplitRoute = tabState?.routes.findLast((route) => route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
    const preservedReportRoute = reportsSplitRoute?.state?.routes.findLast((route) => route.name === SCREENS.REPORT);
    const preservedReportID = getStringParam(preservedReportRoute?.params, 'reportID');

    if (!reportsSplitRoute?.state || preservedReportID !== reportID) {
        return undefined;
    }

    return tabNavigatorRoute?.state?.key;
}

export default getReusableReportsTabStateKey;

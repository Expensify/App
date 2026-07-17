import {getTabState} from '@libs/Navigation/helpers/tabNavigatorUtils';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';

function getStringParam(params: unknown, key: string): string | undefined {
    if (!params || typeof params !== 'object') {
        return undefined;
    }
    const value = Reflect.get(params, key);
    return typeof value === 'string' ? value : undefined;
}

function getReusableReportsTabStateKey(
    rootState: NavigationState | undefined,
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

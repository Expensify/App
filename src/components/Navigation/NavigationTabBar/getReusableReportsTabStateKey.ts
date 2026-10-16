/**
 * Locates Reports tab state so Inbox navigation can reuse a mounted ReportScreen instead of rebuilding its route.
 */
import {getTabNavigatorRoute, getTabState} from '@libs/Navigation/helpers/tabNavigatorUtils';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

import getStringParam from './getStringParam';

type RootNavigationState = NavigationState | PartialState<NavigationState> | undefined;

function getReusableReportsTabStateKey(
    rootState: RootNavigationState,
    reportID: string | undefined,
    reportActionID: string | undefined,
    doesReportActionExist: boolean | undefined,
): string | undefined {
    if (!rootState || !reportID || (reportActionID && !doesReportActionExist)) {
        return undefined;
    }

    const tabNavigatorRoute = getTabNavigatorRoute(rootState);
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

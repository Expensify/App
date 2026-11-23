import {getTabNavigatorRoute} from '@libs/Navigation/helpers/tabNavigatorUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {InsightsDashboardID} from '@src/types/onyx';

import type {NavigationState} from '@react-navigation/native';

/** The Insights route opened when there is no last dashboard to return to, such as in a new browser tab */
const DEFAULT_INSIGHTS_TAB_ROUTE = ROUTES.INSIGHTS.getRoute(CONST.INSIGHTS.DASHBOARD.SPEND);

/** Returns the route of the dashboard the Insights tab last showed, or Spend when there is none or it is no longer accessible. */
function getInsightsTabRoute(rootState: NavigationState | undefined, accessibleDashboards: InsightsDashboardID[]) {
    const insightsParams = getTabNavigatorRoute(rootState)?.state?.routes.find((route) => route.name === SCREENS.INSIGHTS)?.params;
    const lastDashboardID = insightsParams && 'dashboardID' in insightsParams ? Object.values(CONST.INSIGHTS.DASHBOARD).find((id) => id === insightsParams.dashboardID) : undefined;

    if (lastDashboardID && accessibleDashboards.includes(lastDashboardID)) {
        return ROUTES.INSIGHTS.getRoute(lastDashboardID);
    }

    return DEFAULT_INSIGHTS_TAB_ROUTE;
}

export default getInsightsTabRoute;
export {DEFAULT_INSIGHTS_TAB_ROUTE};

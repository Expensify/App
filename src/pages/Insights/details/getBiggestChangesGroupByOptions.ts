import INSIGHTS_DASHBOARD_SPECS, {getVisibleCharts} from '@pages/Insights/dashboardSpecs';

import CONST from '@src/CONST';
import type {InsightsBiggestChangesGroupBy, Policy} from '@src/types/onyx';

/** Returns what Biggest changes can group by, with Members only for people who can see Top spenders in one of the workspaces in scope. */
function getBiggestChangesGroupByOptions(policiesInScope: Policy[], login: string | undefined): InsightsBiggestChangesGroupBy[] {
    const {supportingCharts, isPolicyEligible} = INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.SPEND];
    const topSpenders = supportingCharts.filter(({graphKey}) => graphKey === CONST.INSIGHTS.GRAPH.TOP_SPENDERS);
    const canSeeMembers = getVisibleCharts(topSpenders, policiesInScope, login, isPolicyEligible).length > 0;
    return canSeeMembers ? [CONST.SEARCH.GROUP_BY.CATEGORY, CONST.SEARCH.GROUP_BY.MERCHANT, CONST.SEARCH.GROUP_BY.FROM] : [CONST.SEARCH.GROUP_BY.CATEGORY, CONST.SEARCH.GROUP_BY.MERCHANT];
}

export default getBiggestChangesGroupByOptions;

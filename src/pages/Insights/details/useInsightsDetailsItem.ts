/** Resolves the chart item a Details panel's URL names: the chart it was clicked on, its title and Spend filter, and the color the chart draws it in. */
import VictoryTheme from '@components/Charts/VictoryTheme';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetail} from '@hooks/usePersonalDetails';

import type {InsightsDetailsParamList} from '@libs/Navigation/types';

import type {InsightsChartSpec} from '@pages/Insights/dashboardSpecs';
import INSIGHTS_DASHBOARD_SPECS, {getChartSpec} from '@pages/Insights/dashboardSpecs';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import {getQueryGroupBy} from '@pages/Insights/insightsGroupByUtils';
import {buildChartSnapshotQueryJSON} from '@pages/Insights/insightsQueries';
import useInsightsFilters from '@pages/Insights/useInsightsFilters';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {InsightsDashboardID} from '@src/types/onyx';

import type {InsightsDetailsItem} from './insightsDetailsItem';

import getInsightsItemColor from './getInsightsItemColor';
import {resolveInsightsDetailsItem} from './insightsDetailsItem';

type InsightsDetailsItemData = {
    /** Undefined for a dashboard without a Details panel */
    dashboardID: InsightsDashboardID | undefined;

    /** Undefined when the URL names a chart the dashboard doesn't have */
    chartSpec: InsightsChartSpec | undefined;

    /** Title of the chart, with the violation stage it counted on charts that have a stage control */
    chartTitle: string | undefined;

    /** The dashboard's saved filters */
    filters: InsightsFilters;

    /** Whether the saved filters have loaded, which a period's title depends on */
    isResolved: boolean;

    /** Undefined while the filters load, or when the URL's item can't be resolved */
    item: InsightsDetailsItem | undefined;

    /** The color the chart draws the item in */
    itemColor: string;
};

function useInsightsDetailsItem(params: InsightsDetailsParamList[typeof SCREENS.INSIGHTS_DETAILS]): InsightsDetailsItemData {
    const {translate, dateFnsLocale} = useLocalize();
    const {graphKey, item: itemKey, end: periodEnd, level, parent: parentTagPath, stage} = params;
    const dashboardID = Object.values(CONST.INSIGHTS.DASHBOARD).find((id) => id === params.dashboardID && INSIGHTS_DASHBOARD_SPECS[id].hasDetailsPanel);
    const {filters, isResolved} = useInsightsFilters(dashboardID ?? CONST.INSIGHTS.DASHBOARD.SPEND);

    const pickedViolationStage = Object.values(CONST.INSIGHTS.VIOLATION_STAGE).find((value) => value === stage);
    const chartSpec = dashboardID ? getChartSpec(dashboardID, graphKey, pickedViolationStage) : undefined;
    const isMemberItem = chartSpec?.groupBy === CONST.SEARCH.GROUP_BY.FROM || chartSpec?.groupBy === CONST.SEARCH.GROUP_BY.APPROVER;
    const memberAccountID = isMemberItem ? Number(itemKey) : undefined;
    const [storedMember] = usePersonalDetail(memberAccountID);
    const chartQueryJSON = dashboardID && chartSpec && isResolved ? buildChartSnapshotQueryJSON(dashboardID, chartSpec, filters) : undefined;
    const [chartMember] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${chartQueryJSON?.hash}`, {
        selector: (snapshot) => (memberAccountID === undefined ? undefined : snapshot?.data?.personalDetailsList?.[memberAccountID]),
    });
    // A comparison draws the donut as bars, which are colored by a different ranking
    const shownView = filters.compare && chartSpec?.view === CONST.SEARCH.VIEW.PIE ? CONST.SEARCH.VIEW.BAR : chartSpec?.view;
    const [itemColor = VictoryTheme.colors.default] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${chartQueryJSON?.hash}`, {
        selector: (snapshot) => getInsightsItemColor(snapshot?.data, chartSpec?.groupBy, shownView, chartSpec?.limit, itemKey),
    });

    // A period's title depends on the saved Group by, so nothing resolves until the saved filters load
    const item =
        chartSpec && isResolved
            ? resolveInsightsDetailsItem({
                  groupBy: chartSpec.groupBy ?? getQueryGroupBy(filters),
                  itemKey,
                  periodEnd,
                  parentTagPath,
                  tagLevel: level ? Number(level) : undefined,
                  dateFilterKey: chartSpec.dateFilterKey,
                  member: chartMember ?? storedMember,
                  dateFnsLocale,
                  translate,
              })
            : undefined;

    const chartTitle = chartSpec?.hasViolationStageControl
        ? translate(
              'insightsPage.violationStage.chartTitle',
              translate(chartSpec.titleKey),
              translate(`insightsPage.violationStage.${pickedViolationStage ?? CONST.INSIGHTS.VIOLATION_STAGE.SUBMITTED}`),
          )
        : chartSpec && translate(chartSpec.titleKey);

    return {dashboardID, chartSpec, chartTitle, filters, isResolved, item, itemColor};
}

export default useInsightsDetailsItem;

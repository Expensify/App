import {useReportChartCaptureLoading} from '@components/Charts/context/ChartCaptureContext';
import type {ChartAverage} from '@components/Search/buildChartSeries';
import type {ChartStackStage} from '@components/Search/buildStackedSeries';
import {buildViewOnSpendQuery} from '@components/Search/chartDrillDown';
import ChartEmptyState from '@components/Search/ChartEmptyState';
import ChartErrorState from '@components/Search/ChartErrorState';
import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import {getStageDuration} from '@components/Search/chartMetricValue';
import ChartOfflineState from '@components/Search/ChartOfflineState';
import SearchChartView from '@components/Search/SearchChartView';
import type {GroupedItem, SearchChartCountDimension, SearchQueryJSON} from '@components/Search/types';
import Text from '@components/Text';
import WidgetContainer from '@components/WidgetContainer';
import WidgetHeaderMenu from '@components/WidgetHeaderMenu';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import getSearchTimeGroupingDateKey from '@libs/getSearchTimeGroupingDateKey';
import localFileDownload from '@libs/localFileDownload';
import Navigation from '@libs/Navigation/Navigation';
import {INSIGHTS_CHART_STATE} from '@libs/resolveInsightsChartData';
import {buildSearchQueryJSON, getDateFilterRange} from '@libs/SearchQueryUtils';

import InsightsExplainButton from '@pages/Insights/ai/InsightsExplainButton';
import buildInsightsChartCSV from '@pages/Insights/buildInsightsChartCSV';
import InsightsGroupByDropdown from '@pages/Insights/controls/InsightsGroupByDropdown';
import type {InsightsChartSpec, InsightsChartStage, InsightsViolationStage} from '@pages/Insights/dashboardSpecs';
import {isStackedChart} from '@pages/Insights/dashboardSpecs';
import {getInsightsDetailsItemParams} from '@pages/Insights/details/insightsDetailsItem';
import getInsightsLastDay from '@pages/Insights/getInsightsLastDay';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import DEFAULT_INSIGHTS_FILTERS from '@pages/Insights/insightsFilters';
import {getInsightsGroupByOptions, getQueryGroupBy, getShownGroupBy, isRunningTotalAvailable, isShowingRunningTotal} from '@pages/Insights/insightsGroupByUtils';
import {applyInsightsFilters} from '@pages/Insights/insightsQueries';
import {doesRangeStartBeforeTracking, getTrackedFrom} from '@pages/Insights/insightsTrackedFrom';
import useInsightsChartData from '@pages/Insights/useInsightsChartData';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {InsightsDashboardID, InsightsScope, SearchResults} from '@src/types/onyx';
import type {InsightsHeadlineSummary} from '@src/types/onyx/InsightsDashboard';

import type {OnyxEntry} from 'react-native-onyx';
import type {NonEmptyTuple} from 'type-fest';

import React from 'react';
import {View} from 'react-native';
import Animated, {FadeIn} from 'react-native-reanimated';

import type {InsightsChartMenuAction} from './InsightsChartMenu';

import InsightsChartMenu from './InsightsChartMenu';
import InsightsChartSummary, {InsightsChartSummarySkeleton} from './InsightsChartSummary';
import InsightsDataTable from './InsightsDataTable';
import {getEfficiencyHeadlineAverage} from './insightsHeadlineValues';
import InsightsRankingTable from './InsightsRankingTable';
import InsightsTrackedFromNote from './InsightsTrackedFromNote';

type InsightsChartWidgetProps = {
    dashboardID: InsightsDashboardID;

    chart: InsightsChartSpec;

    /** The chart's own query, with the page's filters applied */
    queryJSON: Readonly<SearchQueryJSON> | undefined;

    /** The snapshot stored under the chart's own query */
    snapshot: OnyxEntry<SearchResults>;

    /** The chart's query for the previous period */
    previousPeriodQueryJSON: Readonly<SearchQueryJSON> | undefined;

    /** The snapshot stored under the chart's query for the previous period */
    previousPeriodSnapshot: OnyxEntry<SearchResults>;
    averageQueryJSON?: Readonly<SearchQueryJSON>;
    averageSnapshot?: OnyxEntry<SearchResults>;

    /** Average the backend returned for the chart's metric, drawn in the Average compare mode */
    average: ChartAverage | undefined;

    headlineSummary?: InsightsHeadlineSummary;

    isHeadline?: boolean;

    shouldWaitForSummary?: boolean;

    /** Whether GetInsights answered the dashboard's query */
    isDashboardLoaded: boolean | undefined;

    /** The chart's stages some workspace in scope is eligible for, set when the chart declares stages */
    stages?: InsightsChartStage[];

    /** Page-level filters every chart on the dashboard is narrowed by */
    filters: InsightsFilters;

    /** Dashboard filters sent to Concierge when the user asks to explain the chart */
    insightsScope: InsightsScope;

    /** What the chart's counts are counts of, which names them in the tooltip */
    countDimension?: SearchChartCountDimension;

    /** Whether the chart links to the Spend page, from its menu and from a pressed point that has no Details panel to open. Defaults to true. */
    supportsDrillIn?: boolean;

    /** Called by the retry button to request the dashboard again */
    onRetry: () => void;

    /** Shows a group-by control in the chart's header when set. Stores the time bucket or Running total the control picks. */
    onGroupByChange?: (update: Partial<InsightsFilters>) => void;

    /** Violation stage a chart that offers one counts, left out by other charts */
    violationStage?: InsightsViolationStage;

    /** Shows the violation stage control in the header of a chart that offers one */
    onViolationStageChange?: (stage: InsightsViolationStage) => void;

    /** Last day GetInsights counted expenses through, as a yyyy-MM-dd string, which the chart and its Details panel treat as today so they stop where the data stops */
    asOfDate?: string;

    /** Controls children stay in the header; other children appear below the plot after loading, including empty charts. */
    children?: React.ReactNode;
};

/** Marks header controls so chart notes can remain below the plot. */
function InsightsChartControls({children}: React.PropsWithChildren) {
    return children;
}

function InsightsChartWidget({
    dashboardID,
    chart,
    queryJSON,
    snapshot,
    previousPeriodQueryJSON,
    previousPeriodSnapshot,
    averageQueryJSON,
    averageSnapshot,
    average,
    headlineSummary,
    isHeadline = false,
    shouldWaitForSummary = false,
    isDashboardLoaded,
    stages,
    filters,
    insightsScope,
    countDimension,
    supportsDrillIn = true,
    onRetry,
    onGroupByChange,
    violationStage,
    onViolationStageChange,
    asOfDate,
    children,
}: InsightsChartWidgetProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {cardPaddingHorizontal, cardPaddingBottom} = useLayoutSpacing();
    const icons = useMemoizedLazyExpensifyIcons(['Expand', 'Table']);
    const {getCurrencyDecimals} = useCurrencyListActions();
    const controls: React.ReactNode[] = [];
    const notes: React.ReactNode[] = [];
    for (const child of React.Children.toArray(children)) {
        if (React.isValidElement(child) && child.type === InsightsChartControls) {
            controls.push(child);
        } else {
            notes.push(child);
        }
    }

    const efficiencyAverage = getEfficiencyHeadlineAverage(headlineSummary?.current, stages);
    const chartAverage = efficiencyAverage === undefined ? average : {...average, [CONST.SEARCH.CHART_METRIC.DURATION]: efficiencyAverage};
    const {data, state, comparison} = useInsightsChartData(
        {chart, queryJSON, snapshot, previousPeriodQueryJSON, previousPeriodSnapshot, averageQueryJSON, averageSnapshot, average: chartAverage, isDashboardLoaded, stages},
        filters,
    );
    const groupBy = chart.groupBy ?? getQueryGroupBy(filters);
    const isLoading = state === INSIGHTS_CHART_STATE.LOADING;
    const isSummaryLoading = isHeadline && (isLoading || (state === INSIGHTS_CHART_STATE.READY && shouldWaitForSummary));
    useReportChartCaptureLoading(isLoading || isSummaryLoading);
    const view = comparison && chart.view === CONST.SEARCH.VIEW.PIE ? CONST.SEARCH.VIEW.BAR : chart.view;
    const isTimeGrouped = !!CHART_GROUP_BY_CONFIG[groupBy].getDateRange;
    const shouldShowTable = !isTimeGrouped && (view === CONST.SEARCH.VIEW.BAR || view === CONST.SEARCH.VIEW.PIE);
    const [firstStackStage, ...otherStackStages] = isStackedChart(chart)
        ? (stages ?? []).map(({workflowStage, durationField, color, comparisonColor}): ChartStackStage => ({
              key: workflowStage,
              label: translate(`search.workflowStages.${workflowStage}`),
              color,
              comparisonColor,
              getValue: (item) => getStageDuration(item, durationField),
          }))
        : [];
    const stackStages: NonEmptyTuple<ChartStackStage> | undefined = firstStackStage ? [firstStackStage, ...otherStackStages] : undefined;

    const groupByOptions = getInsightsGroupByOptions(filters.date);
    // Only line charts plot a running total
    const canRunningTotal = view === CONST.SEARCH.VIEW.LINE && isRunningTotalAvailable(filters.date);
    const shouldShowRunningTotal = isShowingRunningTotal(filters) && view === CONST.SEARCH.VIEW.LINE;
    const today = getInsightsLastDay(asOfDate);
    const trackedFrom = getTrackedFrom(snapshot);

    const downloadCSV = () => {
        if (!queryJSON || state !== INSIGHTS_CHART_STATE.READY) {
            return;
        }

        const content = buildInsightsChartCSV({
            data,
            groupBy,
            dateFilterStart: getDateFilterRange(queryJSON, chart.dateFilterKey ?? getSearchTimeGroupingDateKey(queryJSON)).start,
            currency: filters.groupCurrency,
            getCurrencyDecimals,
            translate,
            today,
            shouldShowRunningTotal,
            countDimension,
            metric: chart.metric,
            stages: stackStages,
        });
        localFileDownload(`Expensify-${chart.graphKey}.csv`, content, translate);
    };

    const openDetails =
        dashboardID === CONST.INSIGHTS.DASHBOARD.SPEND && isBetaEnabled(CONST.BETAS.INSIGHTS_AI) && queryJSON
            ? (item: GroupedItem) => {
                  const itemParams = getInsightsDetailsItemParams(item, queryJSON);
                  if (!itemParams) {
                      return;
                  }
                  const detailsAsOfDate = asOfDate !== getInsightsLastDay(undefined) ? asOfDate : undefined;
                  Navigation.navigate(ROUTES.INSIGHTS_DETAILS.getRoute({dashboardID, graphKey: chart.graphKey, ...itemParams, asOfDate: detailsAsOfDate}));
              }
            : undefined;

    const groupByControl =
        onGroupByChange && (groupByOptions.length > 1 || canRunningTotal) ? (
            <InsightsGroupByDropdown
                groupBy={getShownGroupBy(filters)}
                options={groupByOptions}
                defaultGroupBy={DEFAULT_INSIGHTS_FILTERS[dashboardID].groupBy}
                shouldShowRunningTotalOption={canRunningTotal}
                onChange={onGroupByChange}
            />
        ) : null;

    const explainViolationStage = violationStage ?? chart.violationStage;
    const explainButton =
        isBetaEnabled(CONST.BETAS.INSIGHTS_AI) && (state === INSIGHTS_CHART_STATE.READY || isLoading) ? (
            <InsightsExplainButton
                explainPrompt={translate('insightsPage.explainChartPrompt', translate(chart.titleKey))}
                insightsScope={explainViolationStage ? {...insightsScope, violationStage: explainViolationStage} : insightsScope}
            />
        ) : null;

    const queryJSONForSearch = buildSearchQueryJSON(applyInsightsFilters(chart, filters, undefined, today, trackedFrom)) ?? queryJSON;
    const openOnSpend = () => {
        if (!queryJSONForSearch) {
            return;
        }
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: buildViewOnSpendQuery(queryJSONForSearch)}));
    };

    const menuActions: InsightsChartMenuAction[] = [];
    if (supportsDrillIn) {
        menuActions.push({
            text: translate('insightsPage.viewOnSpend'),
            sentryLabel: CONST.SENTRY_LABEL.INSIGHTS.CHART_MENU_VIEW_ON_SPEND,
            icon: icons.Expand,
            onSelected: openOnSpend,
        });
    }
    if (state === INSIGHTS_CHART_STATE.READY) {
        menuActions.push({
            text: translate('spreadsheet.downloadCSV'),
            sentryLabel: CONST.SENTRY_LABEL.INSIGHTS.CHART_MENU_DOWNLOAD_CSV,
            icon: icons.Table,
            onSelected: downloadCSV,
        });
    }

    const canUseMenuActions = !!queryJSON && (state === INSIGHTS_CHART_STATE.READY || (isLoading && supportsDrillIn));
    const shownViolationStage = chart.hasViolationStageControl ? violationStage : undefined;
    let headerMenu: React.ReactNode = null;
    // The stage row stays reachable while the picked stage is empty or failed, so the user can switch back
    if (shownViolationStage && onViolationStageChange) {
        headerMenu = (
            <InsightsChartMenu
                graphKey={chart.graphKey}
                violationStage={shownViolationStage}
                onViolationStageChange={onViolationStageChange}
                actions={canUseMenuActions ? menuActions : []}
            />
        );
    } else if (canUseMenuActions) {
        headerMenu = (
            <WidgetHeaderMenu
                size={CONST.BUTTON_SIZE.SMALL}
                testID={`insightsChartMenu-${chart.graphKey}`}
                sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.CHART_MENU}
                menuItems={menuActions.map((action) => ({...action, shouldCallAfterModalHide: true}))}
            />
        );
    }

    return (
        <WidgetContainer
            title={translate(chart.titleKey)}
            titleContent={
                shownViolationStage ? (
                    <>
                        <Text style={styles.getWidgetContainerTitleStyle(theme.text)}>{translate(chart.titleKey)}</Text>
                        <Text
                            variant="label"
                            style={styles.textSupporting}
                            numberOfLines={1}
                        >
                            {translate(`insightsPage.violationStage.${shownViolationStage}`)}
                        </Text>
                    </>
                ) : undefined
            }
            titleRightContent={
                controls.length > 0 || !!groupByControl || !!explainButton || !!headerMenu ? (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.flexShrink1]}>
                        {controls}
                        {groupByControl}
                        {explainButton}
                        {headerMenu}
                    </View>
                ) : null
            }
        >
            {/* Loading and ready share a key, so data landing doesn't replay the fade over the skeleton */}
            <Animated.View
                key={isLoading ? INSIGHTS_CHART_STATE.READY : state}
                entering={FadeIn.duration(CONST.SEARCH.ANIMATION.FADE_DURATION)}
            >
                {state === INSIGHTS_CHART_STATE.OFFLINE && <ChartOfflineState />}
                {state === INSIGHTS_CHART_STATE.ERROR && <ChartErrorState onRetry={onRetry} />}
                {state === INSIGHTS_CHART_STATE.EMPTY && <ChartEmptyState testID={`insightsChartEmptyState-${chart.graphKey}`} />}
                {isSummaryLoading && <InsightsChartSummarySkeleton />}
                {isHeadline && state === INSIGHTS_CHART_STATE.READY && headlineSummary && (
                    <InsightsChartSummary
                        summary={headlineSummary}
                        stages={stages}
                        currency={filters.groupCurrency}
                        shouldShowChange={filters.compare === CONST.SEARCH.COMPARE.PREVIOUS_PERIOD && !!comparison}
                    />
                )}
                {(state === INSIGHTS_CHART_STATE.LOADING || state === INSIGHTS_CHART_STATE.READY) &&
                    (view === CONST.SEARCH.VIEW.TABLE ? (
                        <InsightsRankingTable
                            title={translate(chart.titleKey)}
                            data={data}
                            groupBy={groupBy}
                            countDimension={countDimension}
                            rowLimit={chart.limit}
                            comparison={comparison}
                            isComparingPreviousPeriod={filters.compare === CONST.SEARCH.COMPARE.PREVIOUS_PERIOD}
                            queryJSON={queryJSONForSearch}
                            isLoading={isLoading}
                        />
                    ) : (
                        <View style={cardPaddingBottom}>
                            <SearchChartView
                                queryJSON={queryJSON}
                                view={view}
                                groupBy={groupBy}
                                data={data}
                                metric={chart.metric}
                                countDimension={countDimension}
                                isLoading={isLoading}
                                shouldDrillDownOnPress={supportsDrillIn}
                                drillDownQueryJSON={queryJSONForSearch}
                                comparison={comparison}
                                shouldShowRunningTotal={shouldShowRunningTotal}
                                stages={stackStages}
                                chartContainerStyle={cardPaddingHorizontal}
                                dateFilterKey={chart.dateFilterKey}
                                trackedFrom={trackedFrom}
                                today={today}
                                shouldShowSinglePointAsBar
                                shouldShowGroupLabels={isTimeGrouped}
                                onGroupPress={openDetails}
                                tooltipFooter={openDetails ? <Text style={[styles.chartTooltipText, styles.link, styles.mt2]}>{translate('insightsPage.viewDetails')}</Text> : undefined}
                                renderDetails={
                                    shouldShowTable
                                        ? ({rows, formatValue}) => (
                                              <InsightsDataTable
                                                  rows={rows}
                                                  formatValue={formatValue}
                                                  isLoading={isLoading}
                                                  skeletonRowCount={groupBy === CONST.SEARCH.GROUP_BY.WORKFLOW_STAGE ? Object.keys(CONST.SEARCH.WORKFLOW_STAGES).length : undefined}
                                                  onRowPress={openDetails}
                                              />
                                          )
                                        : undefined
                                }
                            />
                        </View>
                    ))}
            </Animated.View>
            {(state === INSIGHTS_CHART_STATE.READY || state === INSIGHTS_CHART_STATE.EMPTY) && (
                <>
                    {isTimeGrouped && !!trackedFrom && doesRangeStartBeforeTracking(filters, trackedFrom) && <InsightsTrackedFromNote trackedFrom={trackedFrom} />}
                    {notes}
                </>
            )}
        </WidgetContainer>
    );
}

InsightsChartWidget.Controls = InsightsChartControls;

export default InsightsChartWidget;

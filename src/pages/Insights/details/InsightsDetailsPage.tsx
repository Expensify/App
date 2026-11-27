import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import VictoryTheme from '@components/Charts/VictoryTheme';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {buildChartDrillDownQuery, buildViewOnSpendQuery} from '@components/Search/chartDrillDown';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {InsightsDetailsParamList} from '@libs/Navigation/types';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';

import INSIGHTS_DASHBOARD_SPECS, {getChartSpec, getPoliciesInScope} from '@pages/Insights/dashboardSpecs';
import getInsightsLastDay from '@pages/Insights/getInsightsLastDay';
import {getCompliancePolicyIDs} from '@pages/Insights/insightsAccess';
import {getQueryGroupBy} from '@pages/Insights/insightsGroupByUtils';
import {
    applyInsightsFilters,
    buildChartSnapshotQueryJSON,
    buildRecentHistoryQueryString,
    buildTopExpensesQueryJSON,
    scopeInsightsDrillDownQuery,
    withInsightsSnapshotHash,
} from '@pages/Insights/insightsQueries';
import useInsightsFilters from '@pages/Insights/useInsightsFilters';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {getYear, parseISO} from 'date-fns';
import React from 'react';
import {View} from 'react-native';

import buildInsightsDetailsQuery from './buildInsightsDetailsQuery';
import getInsightsItemColor from './getInsightsItemColor';
import {resolveInsightsDetailsItem} from './insightsDetailsItem';
import InsightsDetailsSectionError from './InsightsDetailsSectionError';
import {getInsightsDetailsSectionState} from './insightsDetailsSectionState';
import InsightsRecentHistory from './InsightsRecentHistory';
import InsightsSummary from './InsightsSummary';
import InsightsTopExpenses from './InsightsTopExpenses';
import useRequestInsightsDetails from './useRequestInsightsDetails';

type InsightsDetailsPageProps = PlatformStackScreenProps<InsightsDetailsParamList, typeof SCREENS.INSIGHTS_DETAILS>;

/** Details of a point clicked on an Insights chart, opened in the RHP. */
function InsightsDetailsPage({route}: InsightsDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate, dateFnsLocale} = useLocalize();
    const {graphKey, item: itemKey, end: periodEnd, level, parent: parentTagPath, asOf, stage} = route.params;
    const tagLevel = level ? Number(level) : undefined;
    const dashboardID = Object.values(CONST.INSIGHTS.DASHBOARD).find((id) => id === route.params.dashboardID && INSIGHTS_DASHBOARD_SPECS[id].hasDetailsPanel);
    const isCompliance = dashboardID === CONST.INSIGHTS.DASHBOARD.COMPLIANCE;
    const {filters, isResolved} = useInsightsFilters(dashboardID ?? CONST.INSIGHTS.DASHBOARD.SPEND);

    const {login} = useCurrentUserPersonalDetails();
    const [compliancePolicyIDs] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies) => (isCompliance ? getCompliancePolicyIDs(getPoliciesInScope(policies, filters.policyIDs), login) : undefined),
    });

    const pickedViolationStage = Object.values(CONST.INSIGHTS.VIOLATION_STAGE).find((value) => value === stage);
    const chartSpec = dashboardID ? getChartSpec(dashboardID, graphKey, pickedViolationStage) : undefined;
    const isMemberItem = chartSpec?.groupBy === CONST.SEARCH.GROUP_BY.FROM || chartSpec?.groupBy === CONST.SEARCH.GROUP_BY.APPROVER;
    const memberAccountID = isMemberItem ? Number(itemKey) : undefined;
    const [storedMember] = usePersonalDetail(memberAccountID);
    const isTopSpenders = graphKey === CONST.INSIGHTS.GRAPH.TOP_SPENDERS;
    const chartQueryJSON = dashboardID && chartSpec && isResolved ? buildChartSnapshotQueryJSON(dashboardID, chartSpec, filters) : undefined;
    const [chartMember] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${chartQueryJSON?.hash}`, {
        selector: (snapshot) => (memberAccountID === undefined ? undefined : snapshot?.data?.personalDetailsList?.[memberAccountID]),
    });
    const member = chartMember ?? storedMember;
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
                  tagLevel,
                  dateFilterKey: chartSpec.dateFilterKey,
                  member,
                  dateFnsLocale,
                  translate,
              })
            : undefined;
    const canSearchExpenses = !isCompliance || !!compliancePolicyIDs?.length;
    const queryJSONThroughToday =
        chartSpec && isResolved && canSearchExpenses
            ? buildSearchQueryJSON(applyInsightsFilters(chartSpec, {...filters, policyIDs: compliancePolicyIDs ?? filters.policyIDs}, undefined, getInsightsLastDay(asOf)))
            : undefined;
    const drillDownQuery = queryJSONThroughToday && item ? buildChartDrillDownQuery(queryJSONThroughToday, item.filterQuery) : undefined;
    const topExpensesQueryJSON = chartSpec && drillDownQuery ? withInsightsSnapshotHash(buildTopExpensesQueryJSON(drillDownQuery), chartSpec.graphKey) : undefined;
    const topExpensesSnapshotHash = topExpensesQueryJSON?.hash;
    const detailsQuery =
        chartSpec && topExpensesSnapshotHash !== undefined
            ? buildInsightsDetailsQuery({
                  graphKey: chartSpec.graphKey,
                  sections: chartSpec.detailsSections,
                  filters,
                  itemGroupBy: chartSpec.groupBy,
                  itemKey,
                  periodEnd,
                  topExpensesSnapshotHash,
                  lastDay: getInsightsLastDay(asOf),
              })
            : undefined;
    const requestDetails = useRequestInsightsDetails(detailsQuery, isTopSpenders ? undefined : topExpensesQueryJSON, isCompliance);
    const {isOffline} = useNetwork();
    const [details] = useOnyx(`${ONYXKEYS.COLLECTION.INSIGHTS_DETAILS}${detailsQuery?.hash}`);
    const viewAllQueryJSON = scopeInsightsDrillDownQuery(topExpensesQueryJSON, isTopSpenders, details?.eligiblePolicyIDs);
    const recentHistoryQueryJSON =
        chartSpec && detailsQuery && item
            ? scopeInsightsDrillDownQuery(
                  buildSearchQueryJSON(buildRecentHistoryQueryString(filters, detailsQuery.periodGroupBy, detailsQuery.period.end, item.filterQuery)),
                  isTopSpenders,
                  details?.eligiblePolicyIDs,
              )
            : undefined;
    const hasDetailsErrors = !isEmptyObject(details?.errors);
    const summaryState = getInsightsDetailsSectionState({
        isOffline,
        isLoaded: !!details?.summary,
        hasErrors: hasDetailsErrors,
        responseJsonCode: details?.responseJsonCode,
    });
    const recentHistoryState = getInsightsDetailsSectionState({
        isOffline,
        isLoaded: details?.recentHistory !== undefined,
        hasErrors: hasDetailsErrors,
        responseJsonCode: details?.responseJsonCode,
    });
    const hasDetailsFailed = !!detailsQuery && !isOffline && hasDetailsErrors;

    const chartTitle = chartSpec?.hasViolationStageControl
        ? translate(
              'insightsPage.violationStage.chartTitle',
              translate(chartSpec.titleKey),
              translate(`insightsPage.violationStage.${pickedViolationStage ?? CONST.INSIGHTS.VIOLATION_STAGE.SUBMITTED}`),
          )
        : chartSpec && translate(chartSpec.titleKey);

    if (!chartSpec || (isResolved && (!item || compliancePolicyIDs?.length === 0))) {
        return (
            <ScreenWrapper testID="InsightsDetailsPage">
                <FullPageNotFoundView shouldShow />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            testID="InsightsDetailsPage"
            shouldShowOfflineIndicatorInWideScreen
            includeSafeAreaPaddingBottom={false}
        >
            <Header>
                <Header.BackButton />
                <Header.Title title={translate('common.details')} />
            </Header>
            {!!item && !!drillDownQuery && (
                <ScrollView
                    contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pb5, styles.gap5]}
                    addBottomSafeAreaPadding
                >
                    <View style={styles.gap1}>
                        <Text
                            variant="label"
                            style={styles.textSupporting}
                        >
                            {chartTitle}
                        </Text>
                        <Text variant="h1">{item.title}</Text>
                    </View>
                    {hasDetailsFailed ? (
                        <InsightsDetailsSectionError
                            isStale={details?.responseJsonCode === CONST.JSON_CODE.NO_RESPONSE}
                            onRetry={requestDetails}
                        />
                    ) : (
                        <>
                            {!!detailsQuery && (
                                <InsightsSummary
                                    query={detailsQuery}
                                    graphKey={chartSpec.graphKey}
                                    currency={filters.groupCurrency}
                                    summary={details?.summary}
                                    state={summaryState}
                                />
                            )}
                            {!!detailsQuery && !!chartSpec.detailsSections?.includes(CONST.INSIGHTS.DETAILS_SECTION.RECENT_HISTORY) && (
                                <InsightsRecentHistory
                                    query={detailsQuery}
                                    history={details?.recentHistory}
                                    summary={details?.summary}
                                    state={recentHistoryState}
                                    currency={filters.groupCurrency}
                                    color={itemColor}
                                    itemTitle={item.title}
                                    viewAllQuery={recentHistoryQueryJSON && buildSearchQueryString(recentHistoryQueryJSON)}
                                    currentYear={getYear(parseISO(getInsightsLastDay(asOf)))}
                                />
                            )}
                            {!!topExpensesQueryJSON && (!isTopSpenders || !!detailsQuery) && (
                                <InsightsTopExpenses
                                    queryJSON={topExpensesQueryJSON}
                                    title={translate(isCompliance ? 'insightsPage.flaggedExpenses' : 'insightsPage.topExpenses')}
                                    emptyText={isCompliance ? translate('insightsPage.noFlaggedExpensesInRange') : undefined}
                                    viewAllQuery={viewAllQueryJSON && buildViewOnSpendQuery(viewAllQueryJSON)}
                                    onRetry={requestDetails}
                                />
                            )}
                        </>
                    )}
                </ScrollView>
            )}
        </ScreenWrapper>
    );
}

export default InsightsDetailsPage;

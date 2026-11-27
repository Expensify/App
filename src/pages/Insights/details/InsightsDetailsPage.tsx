import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {buildChartDrillDownQuery, buildViewOnSpendQuery} from '@components/Search/chartDrillDown';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {InsightsDetailsParamList} from '@libs/Navigation/types';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import INSIGHTS_DASHBOARD_SPECS, {getChartSpec} from '@pages/Insights/dashboardSpecs';
import getInsightsLastDay from '@pages/Insights/getInsightsLastDay';
import {getQueryGroupBy} from '@pages/Insights/insightsGroupByUtils';
import {applyInsightsFilters, buildChartSnapshotQueryJSON, buildTopExpensesQueryJSON, scopeInsightsDrillDownQuery, withInsightsSnapshotHash} from '@pages/Insights/insightsQueries';
import useInsightsFilters from '@pages/Insights/useInsightsFilters';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React from 'react';
import {View} from 'react-native';

import buildInsightsDetailsQuery from './buildInsightsDetailsQuery';
import {resolveInsightsDetailsItem} from './insightsDetailsItem';
import InsightsDetailsSectionError from './InsightsDetailsSectionError';
import {getInsightsDetailsSectionState, INSIGHTS_DETAILS_SECTION_STATE} from './insightsDetailsSectionState';
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
    const queryJSONThroughToday = chartSpec && isResolved ? buildSearchQueryJSON(applyInsightsFilters(chartSpec, filters, undefined, getInsightsLastDay(asOf))) : undefined;
    const drillDownQuery = queryJSONThroughToday && item ? buildChartDrillDownQuery(queryJSONThroughToday, item.filterQuery) : undefined;
    const topExpensesQueryJSON = chartSpec && drillDownQuery ? withInsightsSnapshotHash(buildTopExpensesQueryJSON(drillDownQuery), chartSpec.graphKey) : undefined;
    const topExpensesSnapshotHash = topExpensesQueryJSON?.hash;
    const detailsQuery =
        chartSpec && topExpensesSnapshotHash !== undefined
            ? buildInsightsDetailsQuery({
                  graphKey: chartSpec.graphKey,
                  filters,
                  itemGroupBy: chartSpec.groupBy,
                  itemKey,
                  periodEnd,
                  topExpensesSnapshotHash,
                  lastDay: getInsightsLastDay(asOf),
                  violationStage: chartSpec.violationStage ?? (chartSpec.hasViolationStageControl ? (pickedViolationStage ?? CONST.INSIGHTS.VIOLATION_STAGE.SUBMITTED) : undefined),
              })
            : undefined;
    const requestDetails = useRequestInsightsDetails(detailsQuery, isTopSpenders ? undefined : topExpensesQueryJSON, isCompliance);
    const {isOffline} = useNetwork();
    const [details] = useOnyx(`${ONYXKEYS.COLLECTION.INSIGHTS_DETAILS}${detailsQuery?.hash}`);
    const viewAllQueryJSON = chartSpec ? scopeInsightsDrillDownQuery(topExpensesQueryJSON, chartSpec.graphKey, details?.eligiblePolicyIDs) : undefined;
    const summary = details?.summary;
    const detailsState = getInsightsDetailsSectionState({
        isOffline,
        isLoaded: !!summary,
        hasErrors: !isEmptyObject(details?.errors),
        responseJsonCode: details?.responseJsonCode,
    });
    const hasDetailsFailed = !!detailsQuery && (detailsState === INSIGHTS_DETAILS_SECTION_STATE.STALE || detailsState === INSIGHTS_DETAILS_SECTION_STATE.ERROR);

    const chartTitle = chartSpec?.hasViolationStageControl
        ? translate(
              'insightsPage.violationStage.chartTitle',
              translate(chartSpec.titleKey),
              translate(`insightsPage.violationStage.${pickedViolationStage ?? CONST.INSIGHTS.VIOLATION_STAGE.SUBMITTED}`),
          )
        : chartSpec && translate(chartSpec.titleKey);

    if (!chartSpec || (isResolved && !item)) {
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
                            isStale={detailsState === INSIGHTS_DETAILS_SECTION_STATE.STALE}
                            onRetry={requestDetails}
                        />
                    ) : (
                        <>
                            {!!detailsQuery && (
                                <InsightsSummary
                                    query={detailsQuery}
                                    graphKey={chartSpec.graphKey}
                                    currency={filters.groupCurrency}
                                    summary={summary}
                                    state={detailsState}
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

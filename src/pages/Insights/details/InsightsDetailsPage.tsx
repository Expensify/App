import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {buildChartDrillDownQuery} from '@components/Search/chartDrillDown';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {usePersonalDetail} from '@hooks/usePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {InsightsDetailsParamList} from '@libs/Navigation/types';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import INSIGHTS_DASHBOARD_SPECS from '@pages/Insights/dashboardSpecs';
import getInsightsLastDay from '@pages/Insights/getInsightsLastDay';
import {getQueryGroupBy} from '@pages/Insights/insightsGroupByUtils';
import {applyInsightsFilters, buildTopExpensesQueryJSON} from '@pages/Insights/insightsQueries';
import useInsightsFilters from '@pages/Insights/useInsightsFilters';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

import buildInsightsDetailsQuery from './buildInsightsDetailsQuery';
import {resolveInsightsDetailsItem} from './insightsDetailsItem';
import InsightsDetailsSectionError from './InsightsDetailsSectionError';
import {INSIGHTS_DETAILS_SECTION_STATE} from './insightsDetailsSectionState';
import InsightsSummary from './InsightsSummary';
import InsightsTopExpenses from './InsightsTopExpenses';
import useInsightsSummary from './useInsightsSummary';
import useRequestInsightsDetails from './useRequestInsightsDetails';

type InsightsDetailsPageProps = PlatformStackScreenProps<InsightsDetailsParamList, typeof SCREENS.INSIGHTS_DETAILS>;

/** Details of a point clicked on an Insights chart, opened in the RHP. */
function InsightsDetailsPage({route}: InsightsDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate, dateFnsLocale} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {graphKey, item: itemKey, end: periodEnd, level, parent: parentTagPath, asOf} = route.params;
    const tagLevel = level ? Number(level) : undefined;
    const {filters, isResolved} = useInsightsFilters(CONST.INSIGHTS.DASHBOARD.SPEND);
    const memberAccountID = graphKey === CONST.INSIGHTS.GRAPH.TOP_SPENDERS ? Number(itemKey) : undefined;
    const [storedMember] = usePersonalDetail(memberAccountID);

    const {headlineChart, supportingCharts} = INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.SPEND];
    const chartSpec = route.params.dashboardID === CONST.INSIGHTS.DASHBOARD.SPEND ? [headlineChart, ...supportingCharts].find((spec) => spec.graphKey === graphKey) : undefined;
    const chartQueryJSON = chartSpec && isResolved ? buildSearchQueryJSON(applyInsightsFilters(chartSpec, filters)) : undefined;
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
                  member,
                  dateFnsLocale,
                  translate,
              })
            : undefined;
    const queryJSONThroughToday = chartSpec && isResolved ? buildSearchQueryJSON(applyInsightsFilters(chartSpec, filters, undefined, getInsightsLastDay(asOf))) : undefined;
    const drillDownQuery = queryJSONThroughToday && item ? buildChartDrillDownQuery(queryJSONThroughToday, item.filterQuery) : undefined;
    const topExpensesQueryJSON = drillDownQuery ? buildTopExpensesQueryJSON(drillDownQuery) : undefined;
    const topExpensesSnapshotHash = topExpensesQueryJSON?.hash;
    const detailsQuery =
        chartSpec && topExpensesSnapshotHash !== undefined
            ? buildInsightsDetailsQuery({graphKey: chartSpec.graphKey, filters, itemGroupBy: chartSpec.groupBy, itemKey, periodEnd, topExpensesSnapshotHash})
            : undefined;
    const requestDetails = useRequestInsightsDetails(detailsQuery, topExpensesQueryJSON);
    const {summary, state: detailsState} = useInsightsSummary(detailsQuery);
    const hasDetailsFailed = !!detailsQuery && (detailsState === INSIGHTS_DETAILS_SECTION_STATE.STALE || detailsState === INSIGHTS_DETAILS_SECTION_STATE.ERROR);

    if (!isBetaEnabled(CONST.BETAS.INSIGHTS_AI) || !chartSpec || (isResolved && !item)) {
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
                            {translate(chartSpec.titleKey)}
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
                            {topExpensesSnapshotHash !== undefined && (
                                <InsightsTopExpenses
                                    query={drillDownQuery}
                                    snapshotHash={topExpensesSnapshotHash}
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

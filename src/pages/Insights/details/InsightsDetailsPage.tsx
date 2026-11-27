import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import {buildViewOnSpendQuery} from '@components/Search/chartDrillDown';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {setInsightsBiggestChangesGroupBy} from '@libs/actions/Insights';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {InsightsDetailsParamList} from '@libs/Navigation/types';
import {buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';

import getInsightsLastDay from '@pages/Insights/getInsightsLastDay';
import {buildRecentHistoryQueryString, scopeInsightsDrillDownQuery} from '@pages/Insights/insightsQueries';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import {getYear, parseISO} from 'date-fns';
import React from 'react';
import {View} from 'react-native';

import buildInsightsDetailsQueries from './buildInsightsDetailsQueries';
import getInsightsAverageComparison, {INSIGHTS_AVERAGE_COMPARISON} from './getInsightsAverageComparison';
import InsightsBiggestChanges from './InsightsBiggestChanges';
import InsightsDetailsSectionError from './InsightsDetailsSectionError';
import {getInsightsDetailsSectionStates} from './insightsDetailsSectionState';
import InsightsRecentHistory from './InsightsRecentHistory';
import InsightsSummary from './InsightsSummary';
import InsightsTopExpenses from './InsightsTopExpenses';
import useBiggestChangesGroupBy from './useBiggestChangesGroupBy';
import useInsightsDetailsItem from './useInsightsDetailsItem';
import useRequestInsightsDetails from './useRequestInsightsDetails';

type InsightsDetailsPageProps = PlatformStackScreenProps<InsightsDetailsParamList, typeof SCREENS.INSIGHTS_DETAILS>;

/** Details of a point clicked on an Insights chart, opened in the RHP. */
function InsightsDetailsPage({route}: InsightsDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {graphKey, item: itemKey, start: periodStart, end: periodEnd, asOf} = route.params;
    const {dashboardID, chartSpec, chartTitle, filters, isResolved, item, itemColor} = useInsightsDetailsItem(route.params);
    const isCompliance = dashboardID === CONST.INSIGHTS.DASHBOARD.COMPLIANCE;
    const isTopSpenders = graphKey === CONST.INSIGHTS.GRAPH.TOP_SPENDERS;
    const {groupBy: biggestChangesGroupBy, options: biggestChangesGroupByOptions} = useBiggestChangesGroupBy(filters.policyIDs);

    const {requestFilters, drillDownQuery, topExpensesQueryJSON, detailsQuery, biggestChangesQuery} =
        chartSpec && item
            ? buildInsightsDetailsQueries({chartSpec, filters, item, itemKey, periodStart, periodEnd, asOf, biggestChangesGroupBy})
            : {requestFilters: filters, drillDownQuery: undefined, topExpensesQueryJSON: undefined, detailsQuery: undefined, biggestChangesQuery: undefined};
    const requestDetails = useRequestInsightsDetails(
        detailsQuery,
        isTopSpenders ? undefined : topExpensesQueryJSON,
        isCompliance,
        biggestChangesQuery && {query: biggestChangesQuery, groupBy: biggestChangesGroupBy},
    );
    const [details] = useOnyx(`${ONYXKEYS.COLLECTION.INSIGHTS_DETAILS}${detailsQuery?.hash}`);
    const sectionStates = getInsightsDetailsSectionStates(details, isOffline, biggestChangesGroupBy);
    const hasDetailsFailed = !!detailsQuery && !isOffline && sectionStates.hasErrors;

    const viewAllQueryJSON = chartSpec ? scopeInsightsDrillDownQuery(topExpensesQueryJSON, chartSpec.graphKey, details?.eligiblePolicyIDs) : undefined;
    const recentHistoryQueryJSON =
        chartSpec && detailsQuery && item
            ? scopeInsightsDrillDownQuery(
                  buildSearchQueryJSON(buildRecentHistoryQueryString(requestFilters, detailsQuery.periodGroupBy, detailsQuery.period.end, item.filterQuery)),
                  chartSpec.graphKey,
                  details?.eligiblePolicyIDs,
              )
            : undefined;
    const comparison = details?.summary ? getInsightsAverageComparison(details.summary) : undefined;
    const shouldShowBiggestChanges =
        !!detailsQuery &&
        !!chartSpec?.detailsSections?.includes(CONST.INSIGHTS.DETAILS_SECTION.BIGGEST_CHANGES) &&
        detailsQuery.periodGroupBy !== CONST.SEARCH.GROUP_BY.YEAR &&
        comparison?.type !== INSIGHTS_AVERAGE_COMPARISON.NOT_ENOUGH_HISTORY;

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
                                    state={sectionStates.summary}
                                />
                            )}
                            {!!detailsQuery && !!chartSpec.detailsSections?.includes(CONST.INSIGHTS.DETAILS_SECTION.RECENT_HISTORY) && (
                                <InsightsRecentHistory
                                    query={detailsQuery}
                                    history={details?.recentHistory}
                                    summary={details?.summary}
                                    state={sectionStates.recentHistory}
                                    currency={filters.groupCurrency}
                                    color={itemColor}
                                    itemTitle={item.title}
                                    viewAllQuery={recentHistoryQueryJSON && buildSearchQueryString(recentHistoryQueryJSON)}
                                    currentYear={getYear(parseISO(getInsightsLastDay(asOf)))}
                                />
                            )}
                            {shouldShowBiggestChanges && (
                                <InsightsBiggestChanges
                                    changes={details?.biggestChanges?.[biggestChangesGroupBy]}
                                    groupBy={biggestChangesGroupBy}
                                    groupByOptions={biggestChangesGroupByOptions}
                                    onGroupByChange={setInsightsBiggestChangesGroupBy}
                                    state={sectionStates.biggestChanges}
                                    currency={filters.groupCurrency}
                                    asOfDate={asOf}
                                    period={detailsQuery.period}
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

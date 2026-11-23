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

import INSIGHTS_DASHBOARD_SPECS, {getDetailsChartSpec} from '@pages/Insights/dashboardSpecs';
import getInsightsLastDay from '@pages/Insights/getInsightsLastDay';
import {getQueryGroupBy} from '@pages/Insights/insightsGroupByUtils';
import {applyInsightsFilters} from '@pages/Insights/insightsQueries';
import useInsightsFilters from '@pages/Insights/useInsightsFilters';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import {View} from 'react-native';

import {resolveInsightsDetailsItem} from './insightsDetailsItem';
import InsightsTopExpenses from './InsightsTopExpenses';

type InsightsDetailsPageProps = PlatformStackScreenProps<InsightsDetailsParamList, typeof SCREENS.INSIGHTS_DETAILS>;

/** Details of a point clicked on an Insights chart, opened in the RHP. */
function InsightsDetailsPage({route}: InsightsDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate, dateFnsLocale} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const {graphKey, item: itemKey, end: periodEnd, level, parent: parentTagPath, asOf, stage} = route.params;
    const tagLevel = level ? Number(level) : undefined;
    const dashboardID = Object.values(CONST.INSIGHTS.DASHBOARD).find((id) => id === route.params.dashboardID && INSIGHTS_DASHBOARD_SPECS[id].hasDetailsPanel);
    const isCompliance = dashboardID === CONST.INSIGHTS.DASHBOARD.COMPLIANCE;
    const {filters, isResolved} = useInsightsFilters(dashboardID ?? CONST.INSIGHTS.DASHBOARD.SPEND);

    const dashboardSpec = dashboardID ? INSIGHTS_DASHBOARD_SPECS[dashboardID] : undefined;
    const chartSpec = dashboardID ? getDetailsChartSpec(dashboardID, graphKey, stage) : undefined;
    const isMemberItem = chartSpec?.groupBy === CONST.SEARCH.GROUP_BY.FROM || chartSpec?.groupBy === CONST.SEARCH.GROUP_BY.APPROVER;
    const memberAccountID = isMemberItem ? Number(itemKey) : undefined;
    const [storedMember] = usePersonalDetail(memberAccountID);
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
                  dateFilterKey: chartSpec.dateFilterKey,
                  member,
                  dateFnsLocale,
                  translate,
              })
            : undefined;
    const queryJSONThroughToday = chartSpec && isResolved ? buildSearchQueryJSON(applyInsightsFilters(chartSpec, filters, undefined, getInsightsLastDay(asOf))) : undefined;
    const drillDownQuery = queryJSONThroughToday && item ? buildChartDrillDownQuery(queryJSONThroughToday, item.filterQuery) : undefined;

    if (!isBetaEnabled(CONST.BETAS.INSIGHTS_AI) || (!!dashboardSpec?.beta && !isBetaEnabled(dashboardSpec.beta)) || !chartSpec || (isResolved && !item)) {
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
                    <InsightsTopExpenses
                        query={drillDownQuery}
                        title={translate(isCompliance ? 'insightsPage.flaggedExpenses' : 'insightsPage.topExpenses')}
                        emptyText={translate(isCompliance ? 'insightsPage.noFlaggedExpensesInRange' : 'insightsPage.noExpensesInRange')}
                        shouldShowViolations={isCompliance}
                    />
                </ScrollView>
            )}
        </ScreenWrapper>
    );
}

export default InsightsDetailsPage;

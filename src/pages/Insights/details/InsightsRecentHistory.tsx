/** Recent history section of the Details panel, with the item's spend in the summarized period and the ones before it. */
import VictoryTheme from '@components/Charts/VictoryTheme';
import ChartOfflineState from '@components/Search/ChartOfflineState';
import type {SearchQueryString} from '@components/Search/types';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import InsightsMeterBar from '@pages/Insights/charts/InsightsMeterBar';
import InsightsRankingTableAverageMarker from '@pages/Insights/charts/InsightsRankingTableAverageMarker';
import type {InsightsTimeGroupBy} from '@pages/Insights/insightsGroupByUtils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {InsightsDetailsHistoryPeriod, InsightsDetailsSummary} from '@src/types/onyx';

import {getYear, parseISO} from 'date-fns';
import React from 'react';
import {View} from 'react-native';

import type {InsightsDetailsQuery} from './buildInsightsDetailsQuery';
import type {InsightsDetailsSectionState} from './insightsDetailsSectionState';

import buildRecentHistoryRows from './buildRecentHistoryRows';
import getInsightsAverageComparison, {INSIGHTS_AVERAGE_COMPARISON} from './getInsightsAverageComparison';
import getInsightsDetailsPeriodName from './getInsightsDetailsPeriodName';
import InsightsDetailsSectionHeader from './InsightsDetailsSectionHeader';
import {INSIGHTS_DETAILS_SECTION_STATE} from './insightsDetailsSectionState';
import InsightsRecentHistorySkeleton from './InsightsRecentHistorySkeleton';

const AVERAGE_FOR_KEYS = {
    [CONST.SEARCH.GROUP_BY.DAY]: 'insightsPage.recentHistory.dayAverageFor',
    [CONST.SEARCH.GROUP_BY.WEEK]: 'insightsPage.recentHistory.weekAverageFor',
    [CONST.SEARCH.GROUP_BY.MONTH]: 'insightsPage.recentHistory.monthAverageFor',
    [CONST.SEARCH.GROUP_BY.QUARTER]: 'insightsPage.recentHistory.quarterAverageFor',
} as const satisfies Record<Exclude<InsightsTimeGroupBy, typeof CONST.SEARCH.GROUP_BY.YEAR>, TranslationPaths>;

type InsightsRecentHistoryProps = {
    query: InsightsDetailsQuery;
    history: InsightsDetailsHistoryPeriod[] | undefined;

    /** Holds the average the bars mark, the same one the Summary compares against */
    summary: InsightsDetailsSummary | undefined;

    state: InsightsDetailsSectionState;
    currency: string;

    /** The color the ranking graph draws the item in */
    color: string;

    /** Name of the item, which the average's key refers to */
    itemTitle: string;

    viewAllQuery: SearchQueryString;

    /** Year of the dashboard's last day, whose periods are named without their year */
    currentYear: number;
};

function InsightsRecentHistory({query, history, summary, state, currency, color, itemTitle, viewAllQuery, currentYear}: InsightsRecentHistoryProps) {
    const styles = useThemeStyles();
    const {translate, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {periodGroupBy, isPeriodInProgress} = query;

    if (state === INSIGHTS_DETAILS_SECTION_STATE.READY && !history?.length) {
        return null;
    }

    const comparison = summary ? getInsightsAverageComparison(summary) : undefined;
    const averageGroupBy = periodGroupBy === CONST.SEARCH.GROUP_BY.YEAR ? undefined : periodGroupBy;
    const shouldShowAverage = !!averageGroupBy && comparison?.type === INSIGHTS_AVERAGE_COMPARISON.CHANGE;
    const {rows, averageWidthPercent} = buildRecentHistoryRows(history ?? [], shouldShowAverage ? (summary?.average ?? undefined) : undefined, isPeriodInProgress);
    const shouldShowAverageKey = !!averageGroupBy && averageWidthPercent !== undefined && !!summary;

    return (
        <View style={[styles.highlightBG, styles.borderRadiusComponentLarge, styles.overflowHidden]}>
            <InsightsDetailsSectionHeader
                title={translate('insightsPage.recentHistory.title')}
                viewAllQuery={viewAllQuery}
                viewAllSentryLabel={CONST.SENTRY_LABEL.INSIGHTS.DETAILS_RECENT_HISTORY_VIEW_ALL}
            />
            {state === INSIGHTS_DETAILS_SECTION_STATE.OFFLINE && <ChartOfflineState />}
            {state === INSIGHTS_DETAILS_SECTION_STATE.LOADING && <InsightsRecentHistorySkeleton />}
            {state === INSIGHTS_DETAILS_SECTION_STATE.READY && (
                <>
                    {rows.map((row, index) => {
                        const amount = convertToDisplayString(row.total, currency);
                        return (
                            <View
                                key={row.start}
                                style={[styles.p4, styles.gap1, (index < rows.length - 1 || shouldShowAverageKey) && styles.borderBottom]}
                            >
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap4]}>
                                    <Text style={styles.flex1}>
                                        {getInsightsDetailsPeriodName(periodGroupBy, row.start, getYear(parseISO(row.start)) !== currentYear, dateFnsLocale, translate)}
                                    </Text>
                                    <View style={styles.flex2}>
                                        <InsightsMeterBar
                                            widthPercent={row.widthPercent}
                                            color={color}
                                            isHatched={row.isInProgress}
                                            averageWidthPercent={averageWidthPercent}
                                        />
                                    </View>
                                </View>
                                <Text
                                    variant="label"
                                    style={styles.textSupporting}
                                >
                                    {row.isInProgress ? translate('search.periodSoFar', {period: amount}) : amount}
                                </Text>
                            </View>
                        );
                    })}
                    {shouldShowAverageKey && (
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.p4]}>
                            <InsightsRankingTableAverageMarker
                                style={styles.insightsRankingTableAverageLegendMark}
                                color={VictoryTheme.colors.getAverageMarkerColor(color)}
                            />
                            <Text
                                variant="label"
                                style={[styles.flex1, styles.textSupporting]}
                                numberOfLines={1}
                            >
                                {translate(AVERAGE_FOR_KEYS[averageGroupBy], summary.averagePeriodCount, itemTitle)}
                            </Text>
                        </View>
                    )}
                </>
            )}
        </View>
    );
}

export default InsightsRecentHistory;

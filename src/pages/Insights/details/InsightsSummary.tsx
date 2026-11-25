/** Summary section of the Details panel, with its Average row and tiles. */
import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import ChartOfflineState from '@components/Search/ChartOfflineState';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {format as formatNumber} from '@libs/NumberFormatUtils';
import {formatPercentOfTotal} from '@libs/PercentageUtils';

import type {InsightsTimeGroupBy} from '@pages/Insights/insightsGroupByUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {InsightsDetailsSummary, InsightsGraphKey} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

import type {InsightsDetailsQuery} from './buildInsightsDetailsQuery';
import type {InsightsAverageComparison} from './getInsightsAverageComparison';
import type {InsightsDetailsSectionState} from './insightsDetailsSectionState';

import getInsightsAverageComparison, {INSIGHTS_AVERAGE_COMPARISON, MIN_AVERAGE_PERIOD_COUNT} from './getInsightsAverageComparison';
import getInsightsDetailsPeriodName from './getInsightsDetailsPeriodName';
import {getPeriodTitle} from './insightsDetailsItem';
import InsightsDetailsSectionHeader from './InsightsDetailsSectionHeader';
import {INSIGHTS_DETAILS_SECTION_STATE} from './insightsDetailsSectionState';
import InsightsSummarySkeleton from './InsightsSummarySkeleton';

/** Periods the average is shown for */
type AveragePeriodGroupBy = Exclude<InsightsTimeGroupBy, typeof CONST.SEARCH.GROUP_BY.YEAR>;

const VERSUS_AVERAGE_PERIOD_KEYS = {
    [CONST.SEARCH.GROUP_BY.DAY]: 'insightsPage.summary.versusAverageDay',
    [CONST.SEARCH.GROUP_BY.WEEK]: 'insightsPage.summary.versusAverageWeek',
    [CONST.SEARCH.GROUP_BY.MONTH]: 'insightsPage.summary.versusAverageMonth',
    [CONST.SEARCH.GROUP_BY.QUARTER]: 'insightsPage.summary.versusAverageQuarter',
} as const satisfies Record<AveragePeriodGroupBy, TranslationPaths>;

const HISTORY_NEEDED_KEYS = {
    [CONST.SEARCH.GROUP_BY.DAY]: 'insightsPage.summary.daysOfHistoryNeeded',
    [CONST.SEARCH.GROUP_BY.WEEK]: 'insightsPage.summary.weeksOfHistoryNeeded',
    [CONST.SEARCH.GROUP_BY.MONTH]: 'insightsPage.summary.monthsOfHistoryNeeded',
    [CONST.SEARCH.GROUP_BY.QUARTER]: 'insightsPage.summary.quartersOfHistoryNeeded',
} as const satisfies Record<AveragePeriodGroupBy, TranslationPaths>;

const AVERAGE_TILE_KEYS = {
    [CONST.SEARCH.GROUP_BY.DAY]: 'insightsPage.summary.dayAverage',
    [CONST.SEARCH.GROUP_BY.WEEK]: 'insightsPage.summary.weekAverage',
    [CONST.SEARCH.GROUP_BY.MONTH]: 'insightsPage.summary.monthAverage',
    [CONST.SEARCH.GROUP_BY.QUARTER]: 'insightsPage.summary.quarterAverage',
} as const satisfies Record<AveragePeriodGroupBy, TranslationPaths>;

type InsightsSummaryProps = {
    query: InsightsDetailsQuery;

    /** The graph the item was clicked on, which decides the wording of the average comparison */
    graphKey: InsightsGraphKey;

    currency: string;
    summary: InsightsDetailsSummary | undefined;
    state: InsightsDetailsSectionState;
};

type SummaryTileProps = {
    label: string;

    /** The value to show, undefined when there's not enough history to compute it */
    value: string | undefined;
};

/** A labeled value in the Summary's grid */
function SummaryTile({label, value}: SummaryTileProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    return (
        <View style={[styles.flex1, styles.gap1]}>
            <Text
                variant="label"
                style={styles.textSupporting}
            >
                {label}
            </Text>
            {value === undefined ? <Text style={StyleUtils.getColorStyle(theme.icon)}>{CONST.INSIGHTS.NO_CHANGE_PLACEHOLDER}</Text> : <Text>{value}</Text>}
        </View>
    );
}

type SummaryAverageComparisonProps = {
    comparison: InsightsAverageComparison;

    /** The graph the item was clicked on, which decides the wording of the comparison */
    graphKey: InsightsGraphKey;

    periodGroupBy: AveragePeriodGroupBy;
    currency: string;
};

/** Row comparing the summarized period's spend to the item's average */
function SummaryAverageComparison({comparison, graphKey, periodGroupBy, currency}: SummaryAverageComparisonProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate, preferredLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong']);
    const illustrations = useMemoizedLazyIllustrations(['CalendarMonthlyMuted']);

    const getVersusAverageLabel = (amount: string) => {
        switch (graphKey) {
            case CONST.INSIGHTS.GRAPH.TOP_MERCHANTS:
                return translate('insightsPage.summary.versusMerchantAverage', amount);
            case CONST.INSIGHTS.GRAPH.TOP_SPENDERS:
                return translate('insightsPage.summary.versusMemberAverage', amount);
            case CONST.INSIGHTS.GRAPH.TOP_CATEGORIES:
                return translate('insightsPage.summary.versusCategoryAverage', amount);
            default:
                return translate(VERSUS_AVERAGE_PERIOD_KEYS[periodGroupBy], amount);
        }
    };

    if (comparison.type === INSIGHTS_AVERAGE_COMPARISON.NOT_ENOUGH_HISTORY) {
        return (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                <ImageSVG
                    src={illustrations.CalendarMonthlyMuted}
                    width={variables.insightsSummaryHistoryIllustrationWidth}
                    height={variables.insightsSummaryHistoryIllustrationHeight}
                />
                <Text
                    variant="label"
                    style={[styles.flex1, StyleUtils.getColorStyle(theme.icon)]}
                >
                    <Text
                        variant="labelStrong"
                        style={StyleUtils.getColorStyle(theme.icon)}
                    >
                        {translate('insightsPage.summary.moreHistoryNeeded')}
                    </Text>{' '}
                    {translate(HISTORY_NEEDED_KEYS[periodGroupBy], MIN_AVERAGE_PERIOD_COUNT)}
                </Text>
            </View>
        );
    }

    // A $0 average means either no spend before or spend and refunds cancelling out, and spend matching the average is neither over nor under
    if (comparison.type === INSIGHTS_AVERAGE_COMPARISON.ZERO_AVERAGE || comparison.difference === 0) {
        return <Text style={StyleUtils.getColorStyle(theme.icon)}>{CONST.INSIGHTS.NO_CHANGE_PLACEHOLDER}</Text>;
    }

    const isIncrease = comparison.difference > 0;
    const changeColor = StyleUtils.getSpendChangeColor(isIncrease);
    const percentage = formatPercentOfTotal(comparison.percentage, comparison.difference, preferredLocale);
    const amount = convertToDisplayString(Math.abs(comparison.difference), currency);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.flexWrap, styles.gap2]}>
            <Text>{translate(isIncrease ? 'insightsPage.summary.over' : 'insightsPage.summary.under', percentage)}</Text>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gapHalf]}>
                <Icon
                    src={isIncrease ? icons.ArrowUpLong : icons.ArrowDownLong}
                    fill={changeColor}
                    width={variables.iconSizeExtraSmall}
                    height={variables.iconSizeExtraSmall}
                />
                <Text
                    variant="label"
                    style={StyleUtils.getColorStyle(changeColor)}
                >
                    {getVersusAverageLabel(amount)}
                </Text>
            </View>
        </View>
    );
}

/** Summary section of the Details panel: the summarized period's spend and how it compares to the item's average */
function InsightsSummary({query, graphKey, currency, summary, state}: InsightsSummaryProps) {
    const styles = useThemeStyles();
    const {translate, preferredLocale, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {period, periodGroupBy, isPeriodInProgress} = query;
    const isSpendOverTime = graphKey === CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME;
    const comparison = summary ? getInsightsAverageComparison(summary) : undefined;
    const hasAverage = !!comparison && comparison.type !== INSIGHTS_AVERAGE_COMPARISON.NOT_ENOUGH_HISTORY;
    // The average covers the 12 months before the period, which never hold enough complete years to compare
    const averagePeriodGroupBy = periodGroupBy === CONST.SEARCH.GROUP_BY.YEAR ? undefined : periodGroupBy;

    const periodTitle = getPeriodTitle(periodGroupBy, period, dateFnsLocale);

    const getSectionTitle = () => {
        if (isSpendOverTime) {
            return translate('insightsPage.summary.title');
        }
        return isPeriodInProgress ? translate('search.periodSoFar', {period: periodTitle}) : periodTitle;
    };

    return (
        <View style={[styles.highlightBG, styles.borderRadiusComponentLarge, styles.overflowHidden]}>
            <InsightsDetailsSectionHeader title={getSectionTitle()} />
            {state === INSIGHTS_DETAILS_SECTION_STATE.OFFLINE && <ChartOfflineState />}
            {state === INSIGHTS_DETAILS_SECTION_STATE.LOADING && <InsightsSummarySkeleton />}
            {state === INSIGHTS_DETAILS_SECTION_STATE.READY && !!summary && !!comparison && (
                <>
                    {!!averagePeriodGroupBy && (
                        <View style={[styles.p4, styles.gap1, styles.borderBottom]}>
                            <Text
                                variant="label"
                                style={styles.textSupporting}
                            >
                                {translate('insightsPage.compare.average')}
                            </Text>
                            <SummaryAverageComparison
                                comparison={comparison}
                                graphKey={graphKey}
                                periodGroupBy={averagePeriodGroupBy}
                                currency={currency}
                            />
                        </View>
                    )}
                    <View style={[styles.flexRow, styles.gap5, styles.p4, styles.borderBottom]}>
                        <SummaryTile
                            label={
                                isSpendOverTime
                                    ? translate('common.spend')
                                    : translate('insightsPage.summary.periodSpend', getInsightsDetailsPeriodName(periodGroupBy, period.start, false, dateFnsLocale, translate))
                            }
                            value={convertToDisplayString(summary.total, currency)}
                        />
                        {averagePeriodGroupBy ? (
                            <SummaryTile
                                label={translate(AVERAGE_TILE_KEYS[averagePeriodGroupBy], hasAverage ? summary.averagePeriodCount : MIN_AVERAGE_PERIOD_COUNT)}
                                value={hasAverage ? convertToDisplayString(summary.average ?? 0, currency) : undefined}
                            />
                        ) : (
                            <View style={styles.flex1} />
                        )}
                    </View>
                    <View style={[styles.flexRow, styles.gap5, styles.p4]}>
                        <SummaryTile
                            label={translate('common.expenses')}
                            value={formatNumber(preferredLocale, summary.count)}
                        />
                        <SummaryTile
                            label={translate('insightsPage.summary.shareOfTotal')}
                            value={formatPercentOfTotal(summary.shareOfTotal, summary.total, preferredLocale)}
                        />
                    </View>
                </>
            )}
        </View>
    );
}

export default InsightsSummary;

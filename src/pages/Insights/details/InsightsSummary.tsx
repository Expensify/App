import Icon from '@components/Icon';
import ImageSVG from '@components/ImageSVG';
import ChartOfflineState from '@components/Search/ChartOfflineState';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {format as formatNumber} from '@libs/NumberFormatUtils';
import {formatPercentOfTotal} from '@libs/PercentageUtils';

import type {InsightsTimeGroupBy} from '@pages/Insights/insightsGroupByUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {InsightsGraphKey} from '@src/types/onyx';

import {format, parseISO} from 'date-fns';
import React from 'react';
import {View} from 'react-native';

import type {InsightsDetailsQuery} from './buildInsightsDetailsQuery';

import getInsightsAverageComparison, {MIN_AVERAGE_PERIOD_COUNT} from './getInsightsAverageComparison';
import {getPeriodTitle} from './insightsDetailsItem';
import InsightsDetailsSectionError from './InsightsDetailsSectionError';
import {INSIGHTS_DETAILS_SECTION_STATE} from './insightsDetailsSectionState';
import InsightsSummarySkeleton from './InsightsSummarySkeleton';
import useInsightsSummary from './useInsightsSummary';

/** Stands in for the average until there's enough history to compute it */
const NO_AVERAGE = '—';

const VERSUS_AVERAGE_PERIOD_KEYS = {
    [CONST.SEARCH.GROUP_BY.DAY]: 'insightsPage.summary.versusAverageDay',
    [CONST.SEARCH.GROUP_BY.WEEK]: 'insightsPage.summary.versusAverageWeek',
    [CONST.SEARCH.GROUP_BY.MONTH]: 'insightsPage.summary.versusAverageMonth',
    [CONST.SEARCH.GROUP_BY.QUARTER]: 'insightsPage.summary.versusAverageQuarter',
    [CONST.SEARCH.GROUP_BY.YEAR]: 'insightsPage.summary.versusAverageYear',
} as const satisfies Record<InsightsTimeGroupBy, TranslationPaths>;

const HISTORY_NEEDED_KEYS = {
    [CONST.SEARCH.GROUP_BY.DAY]: 'insightsPage.summary.daysOfHistoryNeeded',
    [CONST.SEARCH.GROUP_BY.WEEK]: 'insightsPage.summary.weeksOfHistoryNeeded',
    [CONST.SEARCH.GROUP_BY.MONTH]: 'insightsPage.summary.monthsOfHistoryNeeded',
    [CONST.SEARCH.GROUP_BY.QUARTER]: 'insightsPage.summary.quartersOfHistoryNeeded',
    [CONST.SEARCH.GROUP_BY.YEAR]: 'insightsPage.summary.yearsOfHistoryNeeded',
} as const satisfies Record<InsightsTimeGroupBy, TranslationPaths>;

const AVERAGE_TILE_KEYS = {
    [CONST.SEARCH.GROUP_BY.DAY]: 'insightsPage.summary.dayAverage',
    [CONST.SEARCH.GROUP_BY.WEEK]: 'insightsPage.summary.weekAverage',
    [CONST.SEARCH.GROUP_BY.MONTH]: 'insightsPage.summary.monthAverage',
    [CONST.SEARCH.GROUP_BY.QUARTER]: 'insightsPage.summary.quarterAverage',
    [CONST.SEARCH.GROUP_BY.YEAR]: 'insightsPage.summary.yearAverage',
} as const satisfies Record<InsightsTimeGroupBy, TranslationPaths>;

type InsightsSummaryProps = {
    /** Request for the panel the summary belongs to */
    query: InsightsDetailsQuery;

    /** Graph the item was clicked on, which decides what the average is compared as */
    graphKey: InsightsGraphKey;

    /** Currency the amounts are converted to */
    currency: string;
};

type SummaryTileProps = {
    label: string;
    value: string;
};

/** One labeled figure in the Summary's grid. */
function SummaryTile({label, value}: SummaryTileProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flex1, styles.gap1]}>
            <Text
                variant="label"
                style={styles.textSupporting}
            >
                {label}
            </Text>
            <Text>{value}</Text>
        </View>
    );
}

/** Describes the summarized period and how it compares to the item's own average. */
function InsightsSummary({query, graphKey, currency}: InsightsSummaryProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate, preferredLocale, dateFnsLocale} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong']);
    const illustrations = useMemoizedLazyIllustrations(['CalendarMonthly']);
    const {summary, state, retry} = useInsightsSummary(query);
    const {period, periodGroupBy, isPeriodInProgress} = query;
    const isSpendOverTime = graphKey === CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME;

    if (state === INSIGHTS_DETAILS_SECTION_STATE.STALE || state === INSIGHTS_DETAILS_SECTION_STATE.ERROR) {
        return (
            <InsightsDetailsSectionError
                isStale={state === INSIGHTS_DETAILS_SECTION_STATE.STALE}
                onRetry={retry}
            />
        );
    }

    const periodTitle = getPeriodTitle(periodGroupBy, period, dateFnsLocale);

    const getPeriodName = () => {
        const start = parseISO(period.start);
        switch (periodGroupBy) {
            case CONST.SEARCH.GROUP_BY.DAY:
                return format(start, 'MMM d', {locale: dateFnsLocale});
            case CONST.SEARCH.GROUP_BY.WEEK:
                return translate('insightsPage.summary.weekOf', format(start, 'MMM d', {locale: dateFnsLocale}));
            case CONST.SEARCH.GROUP_BY.MONTH:
                return format(start, 'LLLL', {locale: dateFnsLocale});
            case CONST.SEARCH.GROUP_BY.QUARTER:
                return format(start, 'QQQ', {locale: dateFnsLocale});
            default:
                return format(start, 'yyyy', {locale: dateFnsLocale});
        }
    };

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

    const renderAverageRow = () => {
        if (!summary) {
            return null;
        }
        const comparison = getInsightsAverageComparison(summary);

        if (comparison.type === 'notEnoughHistory') {
            return (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.opacitySemiTransparent]}>
                    <ImageSVG
                        src={illustrations.CalendarMonthly}
                        width={variables.insightsSummaryHistoryIllustrationWidth}
                        height={variables.insightsSummaryHistoryIllustrationHeight}
                    />
                    <Text
                        variant="label"
                        style={[styles.flex1, styles.textSupporting]}
                    >
                        <Text
                            variant="labelStrong"
                            style={styles.textSupporting}
                        >
                            {translate('insightsPage.summary.moreHistoryNeeded')}
                        </Text>{' '}
                        {translate(HISTORY_NEEDED_KEYS[periodGroupBy], MIN_AVERAGE_PERIOD_COUNT)}
                    </Text>
                </View>
            );
        }

        if (comparison.type === 'new') {
            return (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.flexWrap, styles.gap2]}>
                    <Text>{translate('insightsPage.summary.new')}</Text>
                    <Text variant="label">{translate('insightsPage.summary.noSpendBefore')}</Text>
                </View>
            );
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
    };

    const renderTiles = () => {
        if (!summary) {
            return null;
        }
        const hasAverage = getInsightsAverageComparison(summary).type !== 'notEnoughHistory';
        const averagePeriodCount = hasAverage ? summary.averagePeriodCount : MIN_AVERAGE_PERIOD_COUNT;

        return (
            <>
                <View style={[styles.flexRow, styles.gap5, styles.p4, styles.borderBottom]}>
                    <SummaryTile
                        label={isSpendOverTime ? translate('insightsPage.summary.spend') : translate('insightsPage.summary.periodSpend', getPeriodName())}
                        value={convertToDisplayString(summary.total, currency)}
                    />
                    <SummaryTile
                        label={translate(AVERAGE_TILE_KEYS[periodGroupBy], averagePeriodCount)}
                        value={hasAverage ? convertToDisplayString(summary.average ?? 0, currency) : NO_AVERAGE}
                    />
                </View>
                <View style={[styles.flexRow, styles.gap5, styles.p4]}>
                    <SummaryTile
                        label={translate('insightsPage.summary.expenses')}
                        value={formatNumber(preferredLocale, summary.count)}
                    />
                    <SummaryTile
                        label={translate('insightsPage.summary.shareOfTotal')}
                        value={formatPercentOfTotal(summary.shareOfTotal, summary.total, preferredLocale)}
                    />
                </View>
            </>
        );
    };

    return (
        <View style={[styles.highlightBG, styles.borderRadiusComponentLarge, styles.overflowHidden]}>
            <View style={[styles.p4, styles.borderBottom]}>
                <Text
                    variant="label"
                    style={styles.textSupporting}
                >
                    {isPeriodInProgress ? translate('insightsPage.summary.periodSoFar', periodTitle) : periodTitle}
                </Text>
            </View>
            {state === INSIGHTS_DETAILS_SECTION_STATE.OFFLINE && <ChartOfflineState />}
            {state === INSIGHTS_DETAILS_SECTION_STATE.LOADING && (
                <View style={styles.p4}>
                    <InsightsSummarySkeleton />
                </View>
            )}
            {state === INSIGHTS_DETAILS_SECTION_STATE.READY && (
                <>
                    <View style={[styles.p4, styles.gap1, styles.borderBottom]}>
                        <Text
                            variant="label"
                            style={styles.textSupporting}
                        >
                            {translate('insightsPage.summary.average')}
                        </Text>
                        {renderAverageRow()}
                    </View>
                    {renderTiles()}
                </>
            )}
        </View>
    );
}

export default InsightsSummary;

/** Displays the headline chart's whole-range values and previous-period change. */
import Icon from '@components/Icon';
import SkeletonTextLine from '@components/Skeletons/SkeletonTextLine';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import type {InsightsChartStage} from '@pages/Insights/dashboardSpecs';

import {lineHeightScale} from '@styles/typography';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {InsightsHeadlineSummary} from '@src/types/onyx/InsightsDashboard';

import React from 'react';
import {View} from 'react-native';

import {getEfficiencyHeadlineAverage, getEfficiencyHeadlineStages} from './insightsHeadlineValues';

const SKELETON_HEADLINE_WIDTH = 136;
const SKELETON_BREAKDOWN_WIDTH = 220;

const stageLabels = {
    [CONST.SEARCH.WORKFLOW_STAGES.CREATED_SUBMITTED]: 'insightsPage.headline.timeToSubmit',
    [CONST.SEARCH.WORKFLOW_STAGES.SUBMITTED_APPROVED]: 'insightsPage.headline.timeToApprove',
    [CONST.SEARCH.WORKFLOW_STAGES.APPROVED_PAID]: 'insightsPage.headline.timeToPay',
} as const;

type InsightsChartSummaryProps = {
    summary: InsightsHeadlineSummary;
    stages?: readonly InsightsChartStage[];
    currency?: string;
    shouldShowChange: boolean;
};

function InsightsChartSummary({summary, stages, currency, shouldShowChange}: InsightsChartSummaryProps) {
    const {translate, numberFormat} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong']);
    const {cardPaddingHorizontal, shouldUseNarrowLayout} = useLayoutSpacing();
    const {current, previous} = summary;
    const formatDuration = (value: number) => DateUtils.formatAverageDuration(value, translate, numberFormat);
    let headline: string;
    let breakdown: string[];
    let value: number;
    let previousValue: number | undefined;
    let isDuration = false;
    if ('total' in current) {
        value = current.total;
        previousValue = previous && 'total' in previous ? previous.total : undefined;
        headline = convertToDisplayString(value, currency);
        breakdown = [
            translate('iou.expenseCount', {
                count: current.expenseCount,
                formattedCount: numberFormat(current.expenseCount),
            }),
        ];
        if (current.expenseCount > 0) {
            const averageExpense = convertToDisplayString(current.total / current.expenseCount, currency);
            breakdown.push(translate('insightsPage.headline.averageExpense', averageExpense));
        }
    } else if ('violations' in current) {
        value = current.violations;
        previousValue = previous && 'violations' in previous ? previous.violations : undefined;
        headline = translate('insightsPage.headline.violationCount', {count: value, formattedCount: numberFormat(value)});
        breakdown = [
            translate('insightsPage.headline.flaggedExpenses', {
                count: current.flaggedExpenses,
                formattedCount: numberFormat(current.flaggedExpenses),
            }),
        ];
    } else {
        const currentStages = getEfficiencyHeadlineStages(current, stages);
        const average = getEfficiencyHeadlineAverage(currentStages);
        if (average === undefined) {
            return null;
        }
        value = average;
        const previousStages = getEfficiencyHeadlineStages(previous, stages);
        // Missing stages are not zero-length stages, so only compare totals for the same stages.
        if (currentStages.length === previousStages.length && currentStages.every(({workflowStage}, index) => workflowStage === previousStages.at(index)?.workflowStage)) {
            previousValue = getEfficiencyHeadlineAverage(previousStages);
        }
        isDuration = true;
        headline = formatDuration(value);
        breakdown = currentStages.map(({workflowStage, duration}) => translate(stageLabels[workflowStage], formatDuration(duration)));
    }

    const difference = previousValue === undefined ? 0 : value - previousValue;
    let change: string | undefined;
    if (shouldShowChange && difference !== 0) {
        if (isDuration) {
            if (Math.round(Math.abs(difference) / CONST.DATE.SECONDS_PER_MINUTE) !== 0) {
                change = formatDuration(Math.abs(difference));
            }
        } else if (previousValue) {
            const ratio = Math.abs(difference / previousValue);
            if (Math.round(ratio * 100) !== 0) {
                change = numberFormat(ratio, {style: 'percent', maximumFractionDigits: 0});
            }
        }
    }

    const isIncrease = difference > 0;
    const changeColor = isIncrease ? theme.textError : theme.textSuccess;
    return (
        <View style={[cardPaddingHorizontal, styles.mb3]}>
            <View style={shouldUseNarrowLayout ? [styles.flexColumn, styles.alignItemsStart, styles.gap1] : [styles.flexRow, styles.flexWrap, styles.alignItemsCenter, styles.gap2]}>
                <Text variant="h1">{headline}</Text>
                {!!change && (
                    <View
                        style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, styles.flexShrink1]}
                        role="group"
                        accessible
                        accessibilityLabel={translate(
                            'insightsPage.headline.vsPreviousPeriod',
                            translate(isIncrease ? 'insightsPage.compare.increase' : 'insightsPage.compare.decrease', change),
                        )}
                    >
                        <Icon
                            src={isIncrease ? icons.ArrowUpLong : icons.ArrowDownLong}
                            fill={changeColor}
                            width={variables.iconSizeXXSmall}
                            height={variables.iconSizeXXSmall}
                        />
                        <Text
                            variant="label"
                            color={changeColor}
                            style={styles.flexShrink1}
                            aria-hidden
                        >
                            {translate('insightsPage.headline.vsPreviousPeriod', change)}
                        </Text>
                    </View>
                )}
            </View>
            <Text
                variant="label"
                style={styles.textSupporting}
            >
                {breakdown.join(` ${CONST.DOT_SEPARATOR} `)}
            </Text>
        </View>
    );
}

function InsightsChartSummarySkeleton() {
    const styles = useThemeStyles();
    const {cardPaddingHorizontal} = useLayoutSpacing();
    return (
        <View style={[cardPaddingHorizontal, styles.mb3]}>
            <SkeletonTextLine
                lineHeight={lineHeightScale.h1}
                barWidth={SKELETON_HEADLINE_WIDTH}
            />
            <SkeletonTextLine
                lineHeight={lineHeightScale.label}
                barWidth={SKELETON_BREAKDOWN_WIDTH}
            />
        </View>
    );
}

export default InsightsChartSummary;
export {InsightsChartSummarySkeleton};

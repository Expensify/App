/** Displays the headline chart's whole-range values and previous-period change. */
import SkeletonTextLine from '@components/Skeletons/SkeletonTextLine';
import Text from '@components/Text';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLayoutSpacing from '@hooks/useLayoutSpacing';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {sanitizeCurrencyCode} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';

import type {InsightsChartStage} from '@pages/Insights/dashboardSpecs';

import {lineHeightScale} from '@styles/typography';

import CONST from '@src/CONST';
import type {InsightsHeadlineSummary} from '@src/types/onyx/InsightsDashboard';

import React from 'react';
import {View} from 'react-native';

import {getEfficiencyHeadlineAverage, getEfficiencyHeadlineStages} from './insightsHeadlineValues';

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
    const {convertToDisplayString, getCurrencyDecimals} = useCurrencyListActions();
    const styles = useThemeStyles();
    const {cardPaddingHorizontal} = useLayoutSpacing();
    const {current, previous} = summary;
    const formatPercent = (value: number, maximumFractionDigits = 0) => numberFormat(value, {style: 'percent', maximumFractionDigits});
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
        const currencyCode = sanitizeCurrencyCode(currency);
        const decimals = getCurrencyDecimals(currencyCode);
        const averageExpense = numberFormat(current.total / current.expenseCount / 100, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
        breakdown = [
            translate('iou.expenseCount', {
                count: current.expenseCount,
                formattedCount: numberFormat(current.expenseCount),
            }),
            translate('insightsPage.headline.averageExpense', averageExpense),
        ];
    } else if ('violations' in current) {
        value = current.violations;
        previousValue = previous && 'violations' in previous ? previous.violations : undefined;
        headline = numberFormat(value);
        breakdown = [
            translate('insightsPage.headline.flaggedExpenses', {
                count: current.flaggedExpenses,
                formattedCount: numberFormat(current.flaggedExpenses),
            }),
            translate('insightsPage.headline.shareOfExpenses', formatPercent(current.eligibleExpenses ? current.flaggedExpenses / current.eligibleExpenses : 0, 1)),
        ];
    } else {
        const average = getEfficiencyHeadlineAverage(current, stages);
        if (average === undefined) {
            return null;
        }
        value = average;
        const currentStages = getEfficiencyHeadlineStages(current, stages);
        const previousStages = getEfficiencyHeadlineStages(previous, stages);
        // Missing stages are not zero-length stages, so only compare totals for the same stages.
        if (currentStages.length === previousStages.length && currentStages.every(({workflowStage}, index) => workflowStage === previousStages.at(index)?.workflowStage)) {
            previousValue = previousStages.reduce((total, stage) => total + stage.duration, 0);
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
                change = formatPercent(ratio);
            }
        }
    }

    return (
        <View style={[cardPaddingHorizontal, styles.mb3]}>
            <View style={[styles.flexRow, styles.flexWrap, styles.alignItemsCenter, styles.gap2]}>
                <Text variant="h1">{headline}</Text>
                {!!change && (
                    <Text
                        variant="label"
                        style={difference > 0 ? styles.textLabelError : styles.textSuccess}
                        accessibilityLabel={translate(
                            'insightsPage.headline.vsPreviousPeriod',
                            translate(difference > 0 ? 'insightsPage.compare.increase' : 'insightsPage.compare.decrease', change),
                        )}
                    >
                        {translate('insightsPage.headline.vsPreviousPeriod', `${difference > 0 ? '↑' : '↓'} ${change}`)}
                    </Text>
                )}
            </View>
            <Text
                variant="label"
                style={styles.textSupporting}
            >
                {breakdown.join(' · ')}
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
                barWidth={136}
            />
            <SkeletonTextLine
                lineHeight={lineHeightScale.label}
                barWidth={220}
            />
        </View>
    );
}

export default InsightsChartSummary;
export {InsightsChartSummarySkeleton};

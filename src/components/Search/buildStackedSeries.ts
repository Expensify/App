/**
 * Builds the series and points of a stacked bar chart, where each time bucket's column stacks one segment per stage,
 * like the time a bucket's reports spent in each workflow stage.
 */
import type {ChartDataPoint, ChartSeries} from '@components/Charts';
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import StringUtils from '@libs/StringUtils';

import CONST from '@src/CONST';

import type {NonEmptyTuple} from 'type-fest';

import type {ChartComparison, SearchChartModel} from './buildChartSeries';
import type {ChartBucketRange} from './chartGroupByConfig';
import type {ChartComparisonPeriods, TimeGroupBy} from './comparisonBuckets';
import type {GroupedItem, SearchChartDataRow, SearchGroupBy} from './types';

import {CHART_SERIES_KEY, getAverageLabelKey, isChartAverage} from './buildChartSeries';
import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';
import {formatDates, getComparedBucketLabels, getCounterpartBucketRange, getPositionInPrimaryPeriod, getUnpairedBucketLabels, isTimeGroupBy} from './comparisonBuckets';

/** Position of each period's stack among the stacks of a bucket */
const STACK_INDEX = {
    PRIMARY: 0,
    COMPARISON: 1,
} as const;

/** One segment of every stack */
type ChartStackStage = {
    /** Identifies the stage among the chart's stages */
    key: string;

    label: string;

    /** Color of the stage's segment in the current period's stack */
    color: string;

    /** Color of the stage's segment in the compared period's stack */
    comparisonColor: string;

    /** Returns the stage's value in a bucket, or null or undefined when the bucket has none, like a stage none of its reports completed */
    getValue: (item: GroupedItem) => number | null | undefined;
};

type BuildStackedSeriesParams = {
    /** Time buckets, in the order the search returned them */
    data: GroupedItem[];

    /** The stages each stack is made of, bottom first. Stages left out draw no segment and add nothing to the average. */
    stages: NonEmptyTuple<ChartStackStage>;

    /** The previous period, drawn as a second stack beside each bucket's own, or the average, drawn as a line */
    comparison?: ChartComparison;

    groupBy: SearchGroupBy;

    /** Returns the full label of a bucket */
    getLabel: (item: GroupedItem) => string;

    /** Returns the compact axis label of a bucket, or undefined to fall back to the full label */
    getShortLabel?: (item: GroupedItem) => string | undefined;

    /** Returns the label of the bucket whose period includes today, or undefined for any other bucket */
    getInProgressLabel?: (item: GroupedItem) => string | undefined;

    /** Returns whether a bucket's period starts after today */
    isLaterPeriod?: (item: GroupedItem) => boolean;

    translate: LocaleContextProps['translate'];

    dateFnsLocale: LocaleContextProps['dateFnsLocale'];
};

/** Returns the key of a stage's series in one period's stack */
function getStackSeriesKey(stackIndex: number, stageKey: string): string {
    return `${stackIndex === STACK_INDEX.PRIMARY ? CHART_SERIES_KEY.PRIMARY : CHART_SERIES_KEY.COMPARISON}:${stageKey}`;
}

/**
 * Returns the sum of each stage's mean value across the buckets.
 * A bucket with no value for a stage is left out of that stage's mean, so a stage that hasn't completed yet doesn't pull the line down, while a real 0 still counts.
 */
function getStackedAverage(data: GroupedItem[], stages: readonly ChartStackStage[]): number | undefined {
    let average: number | undefined;
    for (const stage of stages) {
        const values = data.flatMap((item) => {
            const value = stage.getValue(item);
            return typeof value === 'number' ? [value] : [];
        });
        if (values.length > 0) {
            average = (average ?? 0) + values.reduce((sum, value) => sum + value, 0) / values.length;
        }
    }
    return average;
}

function buildStackedSeries({
    data,
    stages,
    comparison,
    groupBy,
    getLabel,
    getShortLabel,
    getInProgressLabel,
    isLaterPeriod,
    translate,
    dateFnsLocale,
}: BuildStackedSeriesParams): SearchChartModel {
    const {getDateRange} = CHART_GROUP_BY_CONFIG[groupBy];
    const averageValue = isChartAverage(comparison) ? (comparison[CONST.SEARCH.CHART_METRIC.DURATION] ?? getStackedAverage(data, stages)) : undefined;
    const comparedRows = comparison && !isChartAverage(comparison) ? comparison : undefined;
    const periods = comparedRows?.periods;
    // Time buckets of another period cover other dates, so they are keyed by start date
    const comparedByStart = new Map(
        comparedRows?.data.flatMap((item) => {
            const start = getDateRange?.(item)?.start;
            return start ? [[start, item] as const] : [];
        }),
    );

    /** Returns a period's stack at a bucket: each stage's value, and the stages the bucket has no value for */
    const getStackValues = (item: GroupedItem, stackIndex: number) => {
        const values: Record<string, number> = {};
        const unavailableKeys: string[] = [];
        for (const stage of stages) {
            const key = getStackSeriesKey(stackIndex, stage.key);
            const value = stage.getValue(item);
            if (typeof value === 'number') {
                values[key] = value;
            } else {
                unavailableKeys.push(key);
            }
        }
        return {values, unavailableKeys};
    };

    /** Names a period's stack at a bucket in the tooltip, with every stage of the stack sharing it */
    const getStackLabels = (stackIndex: number, label: string | undefined) =>
        label === undefined ? {} : Object.fromEntries(stages.map((stage) => [getStackSeriesKey(stackIndex, stage.key), label]));

    const averageValues = averageValue === undefined ? {} : {[CHART_SERIES_KEY.COMPARISON]: averageValue};

    /** Returns the previous period's bucket a current bucket stands beside, with the labels naming both, or nothing when the chart isn't compared against another period */
    const getPairing = (bucketRange: ChartBucketRange | undefined) => {
        if (!periods || !isTimeGroupBy(groupBy) || !bucketRange) {
            return undefined;
        }
        const counterpartRange = getCounterpartBucketRange(bucketRange, periods, groupBy);
        const comparedItem = counterpartRange && comparedByStart.get(counterpartRange.start);
        return {
            bucketLabels: getComparedBucketLabels(bucketRange, counterpartRange, periods, groupBy, translate, dateFnsLocale),
            compared: comparedItem && getStackValues(comparedItem, STACK_INDEX.COMPARISON),
            counterpartStart: counterpartRange?.start,
        };
    };

    const pairedRows = data.map((item) => {
        const label = StringUtils.normalize(getLabel(item));
        const shortLabel = getShortLabel?.(item);
        const inProgressLabel = getInProgressLabel?.(item);
        const isInProgress = inProgressLabel !== undefined;
        const bucketRange = getDateRange?.(item);
        const current = getStackValues(item, STACK_INDEX.PRIMARY);
        const pairing = getPairing(bucketRange);
        const bucketLabels = pairing?.bucketLabels;
        const primarySeriesLabel = bucketLabels?.seriesLabels.primary;

        const point: ChartDataPoint = {
            label: bucketLabels?.label ?? inProgressLabel ?? label,
            shortLabel: bucketLabels?.shortLabel ?? (isInProgress ? (shortLabel ?? label) : shortLabel),
            values: {
                ...current.values,
                ...pairing?.compared?.values,
                ...averageValues,
            },
            unavailableSeriesKeys: [...current.unavailableKeys, ...(pairing?.compared?.unavailableKeys ?? [])],
            ...(bucketLabels && {
                seriesLabels: {
                    ...getStackLabels(STACK_INDEX.PRIMARY, isInProgress && primarySeriesLabel ? translate('search.periodSoFar', {period: primarySeriesLabel}) : primarySeriesLabel),
                    ...(pairing?.compared && getStackLabels(STACK_INDEX.COMPARISON, bucketLabels.seriesLabels.comparison)),
                },
            }),
            isInProgress: isInProgress || !!isLaterPeriod?.(item),
        };
        const row: SearchChartDataRow = {point, item};
        return {
            row,
            counterpartStart: pairing?.counterpartStart,
            sortDate: bucketRange?.start ?? '',
        };
    });

    /** Builds the point of a compared bucket no current bucket pairs with, like January 31 against February, which only the compared stack reaches */
    const buildUnpairedRow = (comparedItem: GroupedItem, start: string, comparisonPeriods: ChartComparisonPeriods, timeGroupBy: TimeGroupBy) => {
        const range = getDateRange?.(comparedItem) ?? {start, end: start};
        const bucketLabels = getUnpairedBucketLabels(range, comparisonPeriods, timeGroupBy, translate, dateFnsLocale);
        const compared = getStackValues(comparedItem, STACK_INDEX.COMPARISON);
        const point: ChartDataPoint = {
            label: bucketLabels.label,
            shortLabel: bucketLabels.shortLabel,
            values: {...compared.values, ...averageValues},
            unavailableSeriesKeys: compared.unavailableKeys,
            seriesLabels: getStackLabels(STACK_INDEX.COMPARISON, bucketLabels.seriesLabel),
            isInProgress: false,
        };
        const row: SearchChartDataRow = {point};
        return {
            row,
            counterpartStart: undefined,
            sortDate: getPositionInPrimaryPeriod(range, comparisonPeriods, timeGroupBy),
        };
    };

    const pairedStarts = new Set(pairedRows.map((pairedRow) => pairedRow.counterpartStart));
    const unpairedRows =
        periods && isTimeGroupBy(groupBy)
            ? [...comparedByStart].flatMap(([start, comparedItem]) => (pairedStarts.has(start) ? [] : buildUnpairedRow(comparedItem, start, periods, groupBy)))
            : [];

    // Sorted by where each bucket sits in the current period. Stable, so a current bucket stays ahead of a compared one sharing its date.
    const rows = [...pairedRows, ...unpairedRows]
        .sort((first, second) => {
            if (first.sortDate === second.sortDate) {
                return 0;
            }
            return first.sortDate < second.sortDate ? -1 : 1;
        })
        .map(({row}) => row);

    const buildStackSeries = (stackIndex: number, period: ChartComparisonPeriods['primary'] | undefined) =>
        stages.map((stage): ChartSeries => ({
            key: getStackSeriesKey(stackIndex, stage.key),
            label: stage.label,
            color: stackIndex === STACK_INDEX.PRIMARY ? stage.color : stage.comparisonColor,
            stackIndex,
            stackLabel: period && formatDates(period, dateFnsLocale),
        }));
    const [firstSeries, ...otherPrimarySeries] = buildStackSeries(STACK_INDEX.PRIMARY, periods?.primary);
    const comparisonSeries = periods ? buildStackSeries(STACK_INDEX.COMPARISON, periods.comparison) : [];
    const averageSeries: ChartSeries[] =
        averageValue === undefined
            ? []
            : [
                  {
                      key: CHART_SERIES_KEY.COMPARISON,
                      label: translate(getAverageLabelKey(groupBy)),
                      isAverage: true,
                  },
              ];

    return {
        // `stages` isn't empty, so neither is the current period's stack
        series: [firstSeries ?? {key: CHART_SERIES_KEY.PRIMARY}, ...otherPrimarySeries, ...comparisonSeries, ...averageSeries],
        rows,
    };
}

export default buildStackedSeries;
export {getStackedAverage, STACK_INDEX};
export type {ChartStackStage};

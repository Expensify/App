import {CHART_SERIES_KEY} from '@components/Search/buildChartSeries';
import buildStackedSeries, {getStackedAverage, STACK_INDEX} from '@components/Search/buildStackedSeries';
import type {ChartStackStage} from '@components/Search/buildStackedSeries';
import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import {getStageDuration} from '@components/Search/chartMetricValue';
import type {
    TransactionDayGroupListItemType,
    TransactionMonthGroupListItemType,
    TransactionQuarterGroupListItemType,
    TransactionWeekGroupListItemType,
    TransactionYearGroupListItemType,
} from '@components/Search/SearchList/ListItem/types';
import type {GroupedItem, SearchGroupBy} from '@components/Search/types';

import themeColors from '@styles/theme/colors';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {SearchWorkflowStageDurations} from '@src/types/onyx/SearchResults';

import type {NonEmptyTuple} from 'type-fest';

import {translateLocal} from '../utils/TestHelper';

const DAY = CONST.DATE.SECONDS_PER_DAY;

const SUBMIT = CONST.SEARCH.WORKFLOW_STAGES.CREATED_SUBMITTED;
const APPROVE = CONST.SEARCH.WORKFLOW_STAGES.SUBMITTED_APPROVED;
const PAY = CONST.SEARCH.WORKFLOW_STAGES.APPROVED_PAID;

/** Builds a stage reading its duration from the given time-bucket field, colored so each period's segments are told apart */
function stage(key: string, durationField: keyof SearchWorkflowStageDurations, color: string, comparisonColor: string): ChartStackStage {
    return {
        key,
        label: key,
        color,
        comparisonColor,
        getValue: (item) => getStageDuration(item, durationField),
    };
}

const SUBMIT_STAGE = stage(SUBMIT, 'submitAverageTime', themeColors.blue600, themeColors.green600);
const APPROVE_STAGE = stage(APPROVE, 'approveAverageTime', themeColors.blue400, themeColors.green400);
const PAY_STAGE = stage(PAY, 'reimburseAverageTime', themeColors.blue200, themeColors.green200);
const ALL_STAGES: NonEmptyTuple<ChartStackStage> = [SUBMIT_STAGE, APPROVE_STAGE, PAY_STAGE];

/** Fields every bucket carries besides its own date and stage durations */
const BUCKET_BASE = {
    count: 1,
    total: 0,
    currency: CONST.CURRENCY.USD,
    transactions: [],
};

/** Stage durations in days, null for a stage none of the bucket's reports completed */
type StageDays = [number | null, number | null, number | null];

function toDurations([submit, approve, pay]: StageDays): SearchWorkflowStageDurations {
    const toSeconds = (days: number | null) => (days === null ? null : days * DAY);
    return {
        submitAverageTime: toSeconds(submit),
        approveAverageTime: toSeconds(approve),
        reimburseAverageTime: toSeconds(pay),
    };
}

function monthGroup(year: number, month: number, days: StageDays): TransactionMonthGroupListItemType {
    return {
        ...BUCKET_BASE,
        ...toDurations(days),
        groupedBy: CONST.SEARCH.GROUP_BY.MONTH,
        year,
        month,
        formattedMonth: `${month}/${year}`,
        shortFormattedMonth: `${month}`,
        sortKey: year * 100 + month,
        keyForList: `month_${year}_${month}`,
    };
}

function dayGroup(day: string, days: StageDays): TransactionDayGroupListItemType {
    return {
        ...BUCKET_BASE,
        ...toDurations(days),
        groupedBy: CONST.SEARCH.GROUP_BY.DAY,
        day,
        formattedDay: day,
        shortFormattedDay: day,
        lineChartFormattedDay: day,
        keyForList: `day_${day}`,
    };
}

function weekGroup(week: string, days: StageDays): TransactionWeekGroupListItemType {
    return {
        ...BUCKET_BASE,
        ...toDurations(days),
        groupedBy: CONST.SEARCH.GROUP_BY.WEEK,
        week,
        formattedWeek: week,
        shortFormattedWeek: week,
        lineChartFormattedWeek: week,
        keyForList: `week_${week}`,
    };
}

function quarterGroup(year: number, quarter: number, days: StageDays): TransactionQuarterGroupListItemType {
    return {
        ...BUCKET_BASE,
        ...toDurations(days),
        groupedBy: CONST.SEARCH.GROUP_BY.QUARTER,
        year,
        quarter,
        formattedQuarter: `Q${quarter} ${year}`,
        shortFormattedQuarter: `Q${quarter}`,
        sortKey: year * 10 + quarter,
        keyForList: `quarter_${year}_${quarter}`,
    };
}

function yearGroup(year: number, days: StageDays): TransactionYearGroupListItemType {
    return {
        ...BUCKET_BASE,
        ...toDurations(days),
        groupedBy: CONST.SEARCH.GROUP_BY.YEAR,
        year,
        formattedYear: `${year}`,
        sortKey: year,
        keyForList: `year_${year}`,
    };
}

function build(data: GroupedItem[], groupBy: SearchGroupBy, overrides: Partial<Parameters<typeof buildStackedSeries>[0]> = {}) {
    return buildStackedSeries({
        data,
        stages: ALL_STAGES,
        groupBy,
        getLabel: CHART_GROUP_BY_CONFIG[groupBy].getLabel,
        translate: translateLocal,
        dateFnsLocale: undefined,
        ...overrides,
    });
}

const primaryKey = (stageKey: string) => `${CHART_SERIES_KEY.PRIMARY}:${stageKey}`;
const comparisonKey = (stageKey: string) => `${CHART_SERIES_KEY.COMPARISON}:${stageKey}`;

describe('buildStackedSeries', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.EN);
    });

    it.each([
        [CONST.SEARCH.GROUP_BY.DAY, dayGroup('2026-03-02', [1, 2, 3])],
        [CONST.SEARCH.GROUP_BY.WEEK, weekGroup('2026-03-02', [1, 2, 3])],
        [CONST.SEARCH.GROUP_BY.MONTH, monthGroup(2026, 3, [1, 2, 3])],
        [CONST.SEARCH.GROUP_BY.QUARTER, quarterGroup(2026, 1, [1, 2, 3])],
        [CONST.SEARCH.GROUP_BY.YEAR, yearGroup(2026, [1, 2, 3])],
    ])('stacks every stage in a %s bucket, bottom first', (groupBy, bucket) => {
        // Given one bucket of the grouping, with a duration for every stage
        // When the stacked series is built
        const {series, rows} = build([bucket], groupBy);

        // Then the bucket's stack holds one segment per stage in stage order, each in seconds and in its stage's color,
        // because the chart stacks the series of a stack in the order they are listed
        expect(series.map(({key, stackIndex, color}) => ({key, stackIndex, color}))).toEqual([
            {
                key: primaryKey(SUBMIT),
                stackIndex: STACK_INDEX.PRIMARY,
                color: themeColors.blue600,
            },
            {
                key: primaryKey(APPROVE),
                stackIndex: STACK_INDEX.PRIMARY,
                color: themeColors.blue400,
            },
            {
                key: primaryKey(PAY),
                stackIndex: STACK_INDEX.PRIMARY,
                color: themeColors.blue200,
            },
        ]);
        expect(rows.at(0)?.point.values).toEqual({
            [primaryKey(SUBMIT)]: DAY,
            [primaryKey(APPROVE)]: 2 * DAY,
            [primaryKey(PAY)]: 3 * DAY,
        });
    });

    it('draws no segment for a stage none of the bucket reports completed, but names it unavailable', () => {
        // Given a month whose reports were submitted and approved but none of them paid yet, and one whose approval took no time at all
        const data = [monthGroup(2026, 3, [1, 2, null]), monthGroup(2026, 4, [1, 0, 3])];

        // When the stacked series is built
        const {rows} = build(data, CONST.SEARCH.GROUP_BY.MONTH);

        // Then the unpaid stage has no value, so the stack stops at approval, and the tooltip can still list it as unavailable,
        // while a real 0 is kept as a value, since an instant approval is a duration and not missing data
        const [march, april] = rows;
        expect(march?.point.values).toEqual({
            [primaryKey(SUBMIT)]: DAY,
            [primaryKey(APPROVE)]: 2 * DAY,
        });
        expect(march?.point.unavailableSeriesKeys).toEqual([primaryKey(PAY)]);
        expect(april?.point.values[primaryKey(APPROVE)]).toBe(0);
        expect(april?.point.unavailableSeriesKeys).toEqual([]);
    });

    it('leaves the stages it is not given out of the stacks', () => {
        // Given months with an approval duration, charted for workspaces none of which have approvals
        const data = [monthGroup(2026, 3, [1, 2, 3])];

        // When the stacked series is built with only the submit and pay stages
        const {series, rows} = build(data, CONST.SEARCH.GROUP_BY.MONTH, {
            stages: [SUBMIT_STAGE, PAY_STAGE],
        });

        // Then the approval stage draws no segment and isn't named unavailable, because it doesn't apply to these workspaces at all
        expect(series.map(({key}) => key)).toEqual([primaryKey(SUBMIT), primaryKey(PAY)]);
        expect(rows.at(0)?.point.values).toEqual({
            [primaryKey(SUBMIT)]: DAY,
            [primaryKey(PAY)]: 3 * DAY,
        });
        expect(rows.at(0)?.point.unavailableSeriesKeys).toEqual([]);
    });

    it('draws the average as the sum of each stage mean, leaving out buckets that have no value for a stage', () => {
        // Given three months, one of which none of whose reports were paid yet, and one whose approval took no time
        const data = [monthGroup(2026, 1, [2, 4, 6]), monthGroup(2026, 2, [4, 0, null]), monthGroup(2026, 3, [6, 2, 2])];

        // When the stacked series is built against the average
        const {series, rows} = build(data, CONST.SEARCH.GROUP_BY.MONTH, {
            comparison: {},
        });

        // Then the average is (2+4+6)/3 + (4+0+2)/3 + (6+2)/2 = 4 + 2 + 4 = 10 days: the unpaid month is left out of the pay mean
        // so it doesn't pull the line down, while the instant approval still counts as 0
        const expectedAverage = 10 * DAY;
        expect(series.at(-1)).toEqual({
            key: CHART_SERIES_KEY.COMPARISON,
            label: 'Monthly average',
            isAverage: true,
        });
        expect(rows.map((row) => row.point.values[CHART_SERIES_KEY.COMPARISON])).toEqual([expectedAverage, expectedAverage, expectedAverage]);
    });

    it('draws no average when no bucket has a value for any stage', () => {
        // Given a month none of whose reports completed any stage
        const data = [monthGroup(2026, 1, [null, null, null])];

        // When the stacked series is built against the average
        const {series} = build(data, CONST.SEARCH.GROUP_BY.MONTH, {
            comparison: {},
        });

        // Then no average series is added, because there is nothing to average and a line at 0 would read as instant processing
        expect(series.some(({isAverage}) => isAverage)).toBe(false);
        expect(getStackedAverage(data, ALL_STAGES)).toBeUndefined();
    });

    it('uses the range-wide duration when the dashboard supplies it', () => {
        // Given chart buckets that would average to five days if they were weighted equally
        const data = [monthGroup(2026, 1, [2, null, null]), monthGroup(2026, 2, [8, null, null])];

        // When the report-weighted average is three days
        const {rows} = build(data, CONST.SEARCH.GROUP_BY.MONTH, {comparison: {[CONST.SEARCH.CHART_METRIC.DURATION]: 3 * DAY}});

        // Then the average line uses the same value as the headline summary
        expect(rows.map((row) => row.point.values[CHART_SERIES_KEY.COMPARISON])).toEqual([3 * DAY, 3 * DAY]);
    });

    it('stands each bucket beside its previous-period counterpart in a second stack of its own', () => {
        // Given two months of this year and the same months of last year
        const current = [monthGroup(2026, 1, [1, 2, 3]), monthGroup(2026, 2, [2, null, 1])];
        const previous = [monthGroup(2025, 1, [3, 3, 3]), monthGroup(2025, 2, [1, 1, 1])];

        // When the stacked series is built against the previous period
        const {series, rows} = build(current, CONST.SEARCH.GROUP_BY.MONTH, {
            comparison: {
                data: previous,
                color: themeColors.green400,
                periods: {
                    primary: {start: '2026-01-01', end: '2026-02-28'},
                    comparison: {start: '2025-01-01', end: '2025-02-28'},
                },
            },
        });

        // Then every stage has a series in each period's stack, the previous period's in its comparison color,
        // so the chart draws the two stacks side by side in their own hues
        expect(series.map(({key, stackIndex, color}) => ({key, stackIndex, color}))).toEqual([
            {
                key: primaryKey(SUBMIT),
                stackIndex: STACK_INDEX.PRIMARY,
                color: themeColors.blue600,
            },
            {
                key: primaryKey(APPROVE),
                stackIndex: STACK_INDEX.PRIMARY,
                color: themeColors.blue400,
            },
            {
                key: primaryKey(PAY),
                stackIndex: STACK_INDEX.PRIMARY,
                color: themeColors.blue200,
            },
            {
                key: comparisonKey(SUBMIT),
                stackIndex: STACK_INDEX.COMPARISON,
                color: themeColors.green600,
            },
            {
                key: comparisonKey(APPROVE),
                stackIndex: STACK_INDEX.COMPARISON,
                color: themeColors.green400,
            },
            {
                key: comparisonKey(PAY),
                stackIndex: STACK_INDEX.COMPARISON,
                color: themeColors.green200,
            },
        ]);

        // And each month holds both periods' segments, with this February's missing approval still marked unavailable
        const [january, february] = rows;
        expect(january?.point.values).toEqual({
            [primaryKey(SUBMIT)]: DAY,
            [primaryKey(APPROVE)]: 2 * DAY,
            [primaryKey(PAY)]: 3 * DAY,
            [comparisonKey(SUBMIT)]: 3 * DAY,
            [comparisonKey(APPROVE)]: 3 * DAY,
            [comparisonKey(PAY)]: 3 * DAY,
        });
        expect(february?.point.unavailableSeriesKeys).toEqual([primaryKey(APPROVE)]);

        // And every segment of a stack is named by its period's bucket, which titles the stack's section in the tooltip
        expect(january?.point.seriesLabels?.[primaryKey(PAY)]).toBe(january?.point.seriesLabels?.[primaryKey(SUBMIT)]);
        expect(january?.point.seriesLabels?.[comparisonKey(SUBMIT)]).not.toBe(january?.point.seriesLabels?.[primaryKey(SUBMIT)]);
    });

    it('keeps a previous-period bucket no current bucket pairs with, holding only the previous stack', () => {
        // Given February's days compared against January's, where January 31 has no day of February to stand beside
        const current = [dayGroup('2026-02-28', [1, 1, 1])];
        const previous = [dayGroup('2026-01-28', [2, 2, 2]), dayGroup('2026-01-31', [5, null, 5])];

        // When the stacked series is built against the previous period
        const {rows} = build(current, CONST.SEARCH.GROUP_BY.DAY, {
            comparison: {
                data: previous,
                color: themeColors.green400,
                periods: {
                    primary: {start: '2026-02-01', end: '2026-02-28'},
                    comparison: {start: '2026-01-01', end: '2026-01-31'},
                    monthsApart: 1,
                },
            },
        });

        // Then February 28 stands beside January 28, and January 31 gets a bucket of its own after it holding only the previous period's stack,
        // so no previous-period data is dropped and no current stage is named unavailable where the current period has no bucket at all
        expect(rows).toHaveLength(2);
        expect(rows.at(0)?.point.values[comparisonKey(SUBMIT)]).toBe(2 * DAY);
        expect(rows.at(1)?.point.values).toEqual({
            [comparisonKey(SUBMIT)]: 5 * DAY,
            [comparisonKey(PAY)]: 5 * DAY,
        });
        expect(rows.at(1)?.point.unavailableSeriesKeys).toEqual([comparisonKey(APPROVE)]);
        expect(rows.at(1)?.item).toBeUndefined();
    });
});

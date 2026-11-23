import {getHighestPointPositions} from '@components/Charts/hooks/useSyncPointPositions';
import type {ChartDataPoint, ChartSeries} from '@components/Charts/types';
import formatTooltipStacks from '@components/Charts/utils/formatTooltipStacks';
import {getSeriesStacks, getStackTotalsData, getStackTotalSeries} from '@components/Charts/utils/stackedBars';

const CURRENT_SUBMIT: ChartSeries = {
    key: 'primary:submit',
    label: 'Submit',
    color: 'blue',
    stackIndex: 0,
    stackLabel: '2026',
};
const CURRENT_PAY: ChartSeries = {
    key: 'primary:pay',
    label: 'Pay',
    color: 'navy',
    stackIndex: 0,
    stackLabel: '2026',
};
const PREVIOUS_SUBMIT: ChartSeries = {
    key: 'comparison:submit',
    label: 'Submit',
    color: 'green',
    stackIndex: 1,
    stackLabel: '2025',
};
const PREVIOUS_PAY: ChartSeries = {
    key: 'comparison:pay',
    label: 'Pay',
    color: 'teal',
    stackIndex: 1,
    stackLabel: '2025',
};
const AVERAGE: ChartSeries = {
    key: 'comparison',
    label: 'Monthly average',
    isAverage: true,
};

const formatValue = (value: number) => `${value} days`;

describe('stackedBars', () => {
    describe('getSeriesStacks', () => {
        it('groups the stacked series by stack, keeping each stack bottom first', () => {
            // Given a previous-period stack listed before part of the current one, and an average line
            const series = [PREVIOUS_SUBMIT, CURRENT_SUBMIT, AVERAGE, PREVIOUS_PAY, CURRENT_PAY];

            // When the series are grouped into stacks
            const stacks = getSeriesStacks(series);

            // Then the stacks come in stack order with their segments in drawing order, and the average stays out of them,
            // because it is drawn as a line rather than a segment
            expect(stacks).toEqual([
                [CURRENT_SUBMIT, CURRENT_PAY],
                [PREVIOUS_SUBMIT, PREVIOUS_PAY],
            ]);
        });

        it('finds no stacks in a chart whose series are not stacked', () => {
            // Given the series of a plain bar chart compared against another period
            const series: ChartSeries[] = [{key: 'primary'}, {key: 'comparison', color: 'green'}];

            // When the series are grouped into stacks
            // Then there are none, so the chart keeps drawing one bar per series
            expect(getSeriesStacks(series)).toEqual([]);
        });
    });

    describe('getStackTotalsData', () => {
        it('measures each stack whole, across both periods, so the y-axis reaches the tallest one', () => {
            // Given a bucket whose current stack is 1 + 2 days while its previous-period stack is 2 + 4 days, with no segment above 4 days
            const data: ChartDataPoint[] = [
                {
                    label: 'January',
                    values: {
                        [CURRENT_SUBMIT.key]: 1,
                        [CURRENT_PAY.key]: 2,
                        [PREVIOUS_SUBMIT.key]: 2,
                        [PREVIOUS_PAY.key]: 4,
                        [AVERAGE.key]: 5,
                    },
                },
            ];
            const stacks = getSeriesStacks([CURRENT_SUBMIT, CURRENT_PAY, PREVIOUS_SUBMIT, PREVIOUS_PAY]);

            // When the stacks are totalled
            const [totalled] = getStackTotalsData(data, stacks, AVERAGE);
            const [currentTotal, previousTotal] = getStackTotalSeries(stacks);

            // Then each stack holds its full height and the average is kept, so the largest plotted value is the 6-day previous stack,
            // which a domain built from single segments would cut off at 4
            expect(totalled?.values).toEqual({
                [currentTotal?.key ?? '']: 3,
                [previousTotal?.key ?? '']: 6,
                [AVERAGE.key]: 5,
            });
        });

        it('leaves out a stack with no segments at a bucket', () => {
            // Given a bucket only the previous period has data for
            const data: ChartDataPoint[] = [{label: 'Day 31', values: {[PREVIOUS_SUBMIT.key]: 2}}];
            const stacks = getSeriesStacks([CURRENT_SUBMIT, PREVIOUS_SUBMIT]);

            // When the stacks are totalled
            const [totalled] = getStackTotalsData(data, stacks, undefined);

            // Then only the previous stack has a total, so the tooltip anchor isn't pulled down to a current stack of 0
            expect(Object.values(totalled?.values ?? {})).toEqual([2]);
        });
    });

    describe('getHighestPointPositions', () => {
        it('anchors the tooltip of a bucket whose stages are all unavailable at zero', () => {
            // Given a bucket with a 1 + 2 day stack and a bucket none of whose stages has a value, measured as stack totals
            const stacks = getSeriesStacks([CURRENT_SUBMIT, CURRENT_PAY]);
            const data = getStackTotalsData(
                [
                    {label: 'January', values: {[CURRENT_SUBMIT.key]: 1, [CURRENT_PAY.key]: 2}},
                    {label: 'February', values: {}, unavailableSeriesKeys: [CURRENT_SUBMIT.key, CURRENT_PAY.key]},
                ],
                stacks,
                undefined,
            );
            const xScale = (value: number) => value * 100;
            const yScale = (value: number) => 300 - value * 10;

            // When the tooltip positions are computed
            const [xPositions, yPositions] = getHighestPointPositions(data, getStackTotalSeries(stacks), xScale, yScale);

            // Then the empty bucket sits at zero instead of NaN, so its tooltip can still show the stages as unavailable
            expect(xPositions).toEqual([0, 100]);
            expect(yPositions).toEqual([270, 300]);
        });
    });

    describe('formatTooltipStacks', () => {
        it('lists each stack under its period, naming a stage with no value unavailable', () => {
            // Given a bucket whose current reports were not paid yet, compared against last year's and the average
            const point: ChartDataPoint = {
                label: 'February',
                values: {
                    [CURRENT_SUBMIT.key]: 2,
                    [PREVIOUS_SUBMIT.key]: 3,
                    [PREVIOUS_PAY.key]: 0,
                    [AVERAGE.key]: 4,
                },
                unavailableSeriesKeys: [CURRENT_PAY.key],
                seriesLabels: {
                    [CURRENT_SUBMIT.key]: 'February 2026',
                    [CURRENT_PAY.key]: 'February 2026',
                    [PREVIOUS_SUBMIT.key]: 'February 2025',
                    [PREVIOUS_PAY.key]: 'February 2025',
                },
            };

            // When the tooltip is formatted
            const tooltip = formatTooltipStacks(point, [CURRENT_SUBMIT, CURRENT_PAY, PREVIOUS_SUBMIT, PREVIOUS_PAY, AVERAGE], formatValue, 'Unavailable');

            // Then the unpaid stage reads as unavailable instead of disappearing or reading as 0 days, a real 0 is written out,
            // and the average comes last as its own row
            expect(
                tooltip?.stacks.map(({label, rows}) => ({
                    label,
                    rows: rows.map((row) => `${row.label}: ${row.value}`),
                })),
            ).toEqual([
                {
                    label: 'February 2026',
                    rows: ['Submit: 2 days', 'Pay: Unavailable'],
                },
                {label: 'February 2025', rows: ['Submit: 3 days', 'Pay: 0 days']},
            ]);
            expect(tooltip?.averageRow).toMatchObject({
                label: 'Monthly average',
                value: '4 days',
                isAverage: true,
            });
        });

        it('skips a stack the bucket has no data for', () => {
            // Given a bucket only the previous period reaches
            const point: ChartDataPoint = {
                label: 'Day 31',
                values: {[PREVIOUS_SUBMIT.key]: 3},
            };

            // When the tooltip is formatted
            const tooltip = formatTooltipStacks(point, [CURRENT_SUBMIT, PREVIOUS_SUBMIT], formatValue, 'Unavailable');

            // Then only the previous stack is listed, because the current period has no bucket there rather than a missing stage
            expect(tooltip?.stacks.map(({rows}) => rows.map((row) => row.key))).toEqual([[PREVIOUS_SUBMIT.key]]);
        });

        it('leaves charts without stacks to the other tooltips', () => {
            // Given a point of a plain bar chart
            const point: ChartDataPoint = {label: 'Amazon', values: {primary: 3}};

            // When the tooltip is formatted
            // Then nothing comes back, so the chart shows its usual summary or comparison
            expect(formatTooltipStacks(point, [{key: 'primary'}], formatValue, 'Unavailable')).toBeUndefined();
        });
    });
});

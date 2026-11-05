import {renderHook} from '@testing-library/react-native';

import useChartLabelFormats from '@components/Charts/hooks/useChartLabelFormats';
import type {ChartDataPoint, UnitPosition, UnitWithFallback} from '@components/Charts/types';
import {CHART_SERIES_KEY} from '@components/Search/buildChartSeries';

let mockNumberFormat = (n: number, options?: Intl.NumberFormatOptions) => n.toLocaleString('en-US', options);

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        numberFormat: mockNumberFormat,
    })),
);

const SAMPLE_DATA: ChartDataPoint[] = [
    {label: 'Jan', values: {[CHART_SERIES_KEY.PRIMARY]: 100}},
    {label: 'Feb', values: {[CHART_SERIES_KEY.PRIMARY]: 200}},
];

beforeEach(() => {
    mockNumberFormat = (n: number, options?: Intl.NumberFormatOptions) => n.toLocaleString('en-US', options);
});

describe('useChartLabelFormats', () => {
    it('formats with single-char unit without separator', () => {
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, unit: {value: '$', fallback: 'USD'}, unitPosition: 'left'}));

        expect(result.current.formatValue(100)).toBe('$100');
    });

    it('updates unit and position when locale changes', () => {
        const {result, rerender} = renderHook(
            ({unit, position}: {unit: UnitWithFallback; position: UnitPosition}) => useChartLabelFormats({data: SAMPLE_DATA, unit, unitPosition: position}),
            {initialProps: {unit: {value: '$', fallback: 'USD'}, position: 'left' as UnitPosition}},
        );
        expect(result.current.formatValue(1000)).toBe('$1,000');

        mockNumberFormat = (n: number) => n.toLocaleString('de-DE');
        rerender({unit: {value: '€', fallback: 'EUR'}, position: 'right'});
        expect(result.current.formatValue(1000)).toBe('1.000€');
    });

    it('puts a leading unit after the minus sign', () => {
        // Given a currency unit on the left
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, unit: {value: '$', fallback: 'USD'}, unitPosition: 'left'}));

        // When formatting negative values
        const formatted = [result.current.formatValue(-1000), result.current.formatCompactValue(-50000)];

        // Then the sign comes first, the way negative amounts are written, rather than sitting between the unit and the number
        expect(formatted).toEqual(['-$1,000', '-$50k']);
    });

    it('keeps the minus sign in front of the number when the unit trails it', () => {
        // Given a currency unit on the right
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, unit: {value: '€', fallback: 'EUR'}, unitPosition: 'right'}));

        // When formatting a negative value
        const formatted = result.current.formatValue(-1000);

        // Then nothing moves, since the sign already leads
        expect(formatted).toBe('-1,000€');
    });

    it('abbreviates axis values while keeping the unit', () => {
        // Given a currency unit on the left
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, unit: {value: 'zł', fallback: 'PLN'}, unitPosition: 'left'}));

        // When formatting axis ticks compactly
        const formatted = [100000, 1500000].map(result.current.formatCompactValue);

        // Then the numbers are abbreviated with a lowercase k so axis labels stay short, and the multi-char unit keeps its separator
        expect(formatted).toEqual(['zł 100k', 'zł 1.5M']);
    });

    it('writes values with the formatter it is given, in place of the number-and-unit format', () => {
        // Given a chart plotting something other than money, which hands the hook its own formatter and no unit
        const formatValue = (value: number, options?: {shouldUseCompactNotation?: boolean}) =>
            `${value.toLocaleString('en-US', options?.shouldUseCompactNotation ? {notation: 'compact'} : {})} expenses`;
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, formatValue}));

        // When formatting a plotted value and an axis tick
        const formatted = [result.current.formatValue(1200), result.current.formatCompactValue(1200)];

        // Then both come from the given formatter, so the axis, the labels and the tooltip all read the value the same way
        expect(formatted).toEqual(['1,200 expenses', '1.2K expenses']);
    });
});

describe('formatLabel', () => {
    it('returns the label at the given index', () => {
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA}));

        expect(result.current.formatLabel(0)).toBe('Jan');
        expect(result.current.formatLabel(1)).toBe('Feb');
    });

    it('rounds fractional indices to the nearest integer', () => {
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA}));

        expect(result.current.formatLabel(0.4)).toBe('Jan');
        expect(result.current.formatLabel(1.3)).toBe('Feb');
    });

    it('returns empty string for out-of-bounds index', () => {
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA}));

        expect(result.current.formatLabel(5)).toBe('');
    });

    it('skips labels based on labelSkipInterval', () => {
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, labelSkipInterval: 2}));

        expect(result.current.formatLabel(0)).toBe('Jan');
        expect(result.current.formatLabel(1)).toBe('');
    });

    it('uses truncatedLabels when provided and rotation is not vertical', () => {
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, truncatedLabels: ['J', 'F']}));

        expect(result.current.formatLabel(0)).toBe('J');
        expect(result.current.formatLabel(1)).toBe('F');
    });

    it('ignores truncatedLabels when rotation is vertical', () => {
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, truncatedLabels: ['J', 'F'], labelRotation: 90}));

        expect(result.current.formatLabel(0)).toBe('Jan');
        expect(result.current.formatLabel(1)).toBe('Feb');
    });
});

describe('formatExactValue', () => {
    it('keeps trailing zeros up to the given decimals', () => {
        // Given a currency with two decimals
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, unit: {value: '$', fallback: 'USD'}}));

        // When formatting whole and half amounts, including one too large for the center total
        const formatted = [3527, 3527.5, 12100000].map((total) => result.current.formatExactValue(total, 2));

        // Then every amount shows both decimals, the way money is written
        expect(formatted).toEqual(['$3,527.00', '$3,527.50', '$12,100,000.00']);
    });
});

describe('formatTotalValue', () => {
    const DOLLAR = {value: '$', fallback: 'USD'};

    it('keeps the decimals under 1m', () => {
        // Given a currency with two decimals
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, unit: DOLLAR}));

        // When formatting totals with up to six integer digits
        const formatted = [3527, 999999.99].map((total) => result.current.formatTotalValue(total, 2));

        // Then the full amount is shown with the currency's decimals
        expect(formatted).toEqual(['$3,527.00', '$999,999.99']);
    });

    it('drops the decimals from 1m to under 10m', () => {
        // Given a currency with two decimals
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, unit: DOLLAR}));

        // When formatting totals with seven integer digits
        const formatted = [1000000, 1234567.8].map((total) => result.current.formatTotalValue(total, 2));

        // Then the full amount is rounded to a whole number, so it still fits in the donut
        expect(formatted).toEqual(['$1,000,000', '$1,234,568']);
    });

    it('uses the compact form from 10m up', () => {
        // Given a currency with two decimals
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, unit: DOLLAR}));

        // When formatting totals with eight or more integer digits
        const formatted = [10000000, 2000000000].map((total) => result.current.formatTotalValue(total, 2));

        // Then the total matches the compact form of the y-axis labels
        expect(formatted).toEqual(['$10M', '$2B']);
    });

    it('shows no decimals for a currency without them', () => {
        // Given a currency with zero decimals
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, unit: {value: '¥', fallback: 'JPY'}}));

        // When formatting a total under 1m
        const formatted = result.current.formatTotalValue(3527, 0);

        // Then no decimals are added, since the currency has none
        expect(formatted).toBe('¥3,527');
    });

    it('uses the chart value formatter when one is given', () => {
        // Given a chart plotting expense counts, with its own value formatter
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, unit: DOLLAR, formatValue: (value) => `${value} expenses`}));

        // When formatting a total of every size
        const formatted = [42, 1234567, 12100000].map((total) => result.current.formatTotalValue(total, 2));

        // Then the formatter wins, so a count is never written as money
        expect(formatted).toEqual(['42 expenses', '1234567 expenses', '12100000 expenses']);
    });

    it('shortens negative totals at the same thresholds', () => {
        // Given a currency with two decimals
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, unit: DOLLAR}));

        // When formatting negative totals in each range
        const formatted = [-3527, -1234567.8, -12100000].map((total) => result.current.formatTotalValue(total, 2));

        // Then the thresholds use the absolute value and the minus sign leads the unit
        expect(formatted).toEqual(['-$3,527.00', '-$1,234,568', '-$12M']);
    });
});

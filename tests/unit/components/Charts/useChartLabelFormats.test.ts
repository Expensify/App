import {renderHook} from '@testing-library/react-native';

import useChartLabelFormats from '@components/Charts/hooks/useChartLabelFormats';
import type {ChartDataPoint, UnitPosition, UnitWithFallback} from '@components/Charts/types';

let mockNumberFormat = (n: number, options?: Intl.NumberFormatOptions) => n.toLocaleString('en-US', options);

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        numberFormat: mockNumberFormat,
    })),
);

const SAMPLE_DATA: ChartDataPoint[] = [
    {label: 'Jan', total: 100},
    {label: 'Feb', total: 200},
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

    it('abbreviates axis values while keeping the unit', () => {
        // Given a currency unit on the left
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, unit: {value: 'zł', fallback: 'PLN'}, unitPosition: 'left'}));

        // When formatting axis ticks compactly
        const formatted = [100000, 1500000].map(result.current.formatCompactValue);

        // Then the numbers are abbreviated with a lowercase k so axis labels stay short, and the multi-char unit keeps its separator
        expect(formatted).toEqual(['zł 100k', 'zł 1.5M']);
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

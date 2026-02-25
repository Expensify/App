import type {SkFont} from '@shopify/react-native-skia';
import {renderHook} from '@testing-library/react-native';
import useChartLabelFormats from '@components/Charts/hooks/useChartLabelFormats';
import type {ChartDataPoint, UnitPosition, UnitWithFallback} from '@components/Charts/types';

let mockNumberFormat = (n: number) => n.toLocaleString('en-US');

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        numberFormat: mockNumberFormat,
    })),
);

const mockFont = (supported: string) => ({getGlyphIDs: (text: string) => [...text].map((ch) => (supported.includes(ch) ? 1 : 0))}) as unknown as SkFont;

const SAMPLE_DATA: ChartDataPoint[] = [
    {label: 'Jan', total: 100},
    {label: 'Feb', total: 200},
];

beforeEach(() => {
    mockNumberFormat = (n: number) => n.toLocaleString('en-US');
});

describe('useChartLabelFormats', () => {
    it('falls back to currency code when font cannot render the symbol', () => {
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, font: mockFont('$'), unit: {value: '₹', fallback: 'INR'}, unitPosition: 'left'}));

        expect(result.current.formatValue(100)).toBe('INR 100');
    });

    it('keeps the symbol when font supports it', () => {
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, font: mockFont('$'), unit: {value: '$', fallback: 'USD'}, unitPosition: 'left'}));

        expect(result.current.formatValue(100)).toBe('$100');
    });

    it('updates unit and position when locale changes', () => {
        const {result, rerender} = renderHook(
            ({unit, position}: {unit: UnitWithFallback; position: UnitPosition}) => useChartLabelFormats({data: SAMPLE_DATA, font: mockFont('$€'), unit, unitPosition: position}),
            {initialProps: {unit: {value: '$', fallback: 'USD'}, position: 'left' as UnitPosition}},
        );
        expect(result.current.formatValue(1000)).toBe('$1,000');

        mockNumberFormat = (n: number) => n.toLocaleString('de-DE');
        rerender({unit: {value: '€', fallback: 'EUR'}, position: 'right'});
        expect(result.current.formatValue(1000)).toBe('1.000€');
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
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, truncatedLabels: ['J', 'F'], labelRotation: -90}));

        expect(result.current.formatLabel(0)).toBe('Jan');
        expect(result.current.formatLabel(1)).toBe('Feb');
    });
});

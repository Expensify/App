import type {SkFont} from '@shopify/react-native-skia';
import {renderHook} from '@testing-library/react-native';
import useChartLabelFormats from '@components/Charts/hooks/useChartLabelFormats';
import type {ChartDataPoint, YAxisUnit, YAxisUnitPosition} from '@components/Charts/types';

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
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, font: mockFont('$'), yAxisUnit: {value: '₹', fallback: 'INR'}, yAxisUnitPosition: 'left'}));

        expect(result.current.formatYAxisLabel(100)).toBe('INR 100');
    });

    it('keeps the symbol when font supports it', () => {
        const {result} = renderHook(() => useChartLabelFormats({data: SAMPLE_DATA, font: mockFont('$'), yAxisUnit: {value: '$', fallback: 'USD'}, yAxisUnitPosition: 'left'}));

        expect(result.current.formatYAxisLabel(100)).toBe('$100');
    });

    it('updates unit and position when locale changes', () => {
        const {result, rerender} = renderHook(
            ({unit, position}: {unit: YAxisUnit; position: YAxisUnitPosition}) =>
                useChartLabelFormats({data: SAMPLE_DATA, font: mockFont('$€'), yAxisUnit: unit, yAxisUnitPosition: position}),
            {initialProps: {unit: {value: '$', fallback: 'USD'}, position: 'left'}},
        );
        expect(result.current.formatYAxisLabel(1000)).toBe('$1,000');

        mockNumberFormat = (n: number) => n.toLocaleString('de-DE');
        rerender({unit: {value: '€', fallback: 'EUR'}, position: 'right'});
        expect(result.current.formatYAxisLabel(1000)).toBe('1.000€');
    });
});

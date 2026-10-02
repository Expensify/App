import {renderHook} from '@testing-library/react-native';

import useTooltipData from '@components/Charts/hooks/useTooltipData';
import type {ChartDataPoint, ChartSeries} from '@components/Charts/types';

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({preferredLocale: 'en'})));

const formatAmount = (value: number) => `$${value}`;

const POINT: ChartDataPoint = {label: 'Travel', values: {primary: 300, comparison: 100}, percentOfTotal: 60};

describe('useTooltipData', () => {
    it('reads one row per compared series, keyed by series and without the share of spend', () => {
        // Given a point plotted for two named periods
        const series: ChartSeries[] = [
            {key: 'primary', label: 'Sep 2026'},
            {key: 'comparison', label: 'Aug 2026'},
        ];

        // When the tooltip for that point is built
        const {result} = renderHook(() => useTooltipData(0, [POINT], series, formatAmount));

        // Then each period gets its own row with its own amount, and the share is left out since it only describes one period
        expect(result.current).toEqual({
            title: 'Travel',
            rows: [
                {key: 'primary', label: 'Sep 2026', amount: '$300', percentage: undefined},
                {key: 'comparison', label: 'Aug 2026', amount: '$100', percentage: undefined},
            ],
        });
    });

    it('keeps the share of spend for a single series', () => {
        // Given the same point plotted for one unnamed series
        const series: ChartSeries[] = [{key: 'primary'}];

        // When the tooltip for that point is built
        const {result} = renderHook(() => useTooltipData(0, [POINT], series, formatAmount));

        // Then its one row carries the share of spend next to the amount
        expect(result.current?.rows).toEqual([{key: 'primary', label: undefined, amount: '$300', percentage: '60%'}]);
    });
});

import {renderHook} from '@testing-library/react-native';

import useTooltipData from '@components/Charts/hooks/useTooltipData';
import type {ChartDataPoint, ChartSeries} from '@components/Charts/types';

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({preferredLocale: 'en'})));

const formatAmount = (value: number) => `$${value}`;

const POINT: ChartDataPoint = {label: 'Travel', values: {primary: 300, comparison: 100}, percentOfTotal: 60};

describe('useTooltipData', () => {
    it('reads one row per compared series, named by the dates it covers and without the share of spend', () => {
        // Given a point plotted for two periods, each naming the dates its value covers
        const series: ChartSeries[] = [{key: 'primary'}, {key: 'comparison'}];
        const point: ChartDataPoint = {...POINT, seriesLabels: {primary: 'Sep 2026', comparison: 'Aug 2026'}};

        // When the tooltip for that point is built
        const {result} = renderHook(() => useTooltipData(0, [point], series, formatAmount));

        // Then each period gets its own row with its own amount, and the share is left out since it only describes one period
        expect(result.current).toEqual({
            title: 'Travel',
            rows: [
                {key: 'primary', label: 'Sep 2026', amount: '$300', percentage: undefined},
                {key: 'comparison', label: 'Aug 2026', amount: '$100', percentage: undefined},
            ],
        });
    });

    it('leaves out the row of a series with nothing at the point', () => {
        // Given a point the compared period has no matching bucket for, like October 31 against September
        const series: ChartSeries[] = [{key: 'primary'}, {key: 'comparison'}];
        const point: ChartDataPoint = {label: '31st', values: {primary: 300}, seriesLabels: {primary: 'Oct 31, 2026'}};

        // When the tooltip for that point is built
        const {result} = renderHook(() => useTooltipData(0, [point], series, formatAmount));

        // Then only the current period has a row, rather than a made-up zero for a day that doesn't exist
        expect(result.current?.rows).toEqual([{key: 'primary', label: 'Oct 31, 2026', amount: '$300', percentage: undefined}]);
    });

    it('keeps the share of spend for a single series', () => {
        // Given the same point plotted for one series
        const series: ChartSeries[] = [{key: 'primary'}];

        // When the tooltip for that point is built
        const {result} = renderHook(() => useTooltipData(0, [POINT], series, formatAmount));

        // Then its one row carries the share of spend next to the amount
        expect(result.current?.rows).toEqual([{key: 'primary', label: undefined, amount: '$300', percentage: '60%'}]);
    });
});

import type {ChartDataPoint, ChartSeries} from '@components/Charts/types';
import {getSeriesValue} from '@components/Charts/utils';

import useLocalize from '@hooks/useLocalize';

import {formatPercentOfTotal} from '@libs/PercentageUtils';

type TooltipRow = {
    /** Name of the series this row reads, left out by a chart plotting a single unnamed series */
    label?: string;

    /** The series' amount at the active point */
    amount: string;

    /** The amount's share of total spend, which only the window on screen has */
    percentage?: string;
};

type TooltipData = {
    /** The active point's label */
    title: string;

    rows: TooltipRow[];
};

/**
 * Formats tooltip content for the active chart data point: one row per plotted series.
 * The share of total spend is read off the point, so it describes the window on screen alone.
 */
function useTooltipData(activeDataIndex: number, data: ChartDataPoint[], series: ChartSeries[], formatAmount: (value: number) => string): TooltipData | null {
    const {preferredLocale} = useLocalize();

    if (activeDataIndex < 0 || activeDataIndex >= data.length) {
        return null;
    }
    const dataPoint = data.at(activeDataIndex);
    if (!dataPoint) {
        return null;
    }

    return {
        title: dataPoint.label,
        rows: series.map((seriesItem, index) => {
            const value = getSeriesValue(dataPoint, seriesItem.key);
            const isPrimarySeries = index === 0;

            return {
                label: seriesItem.label,
                amount: formatAmount(value),
                percentage: isPrimarySeries && dataPoint.percentOfTotal !== undefined ? formatPercentOfTotal(dataPoint.percentOfTotal, value, preferredLocale) : undefined,
            };
        }),
    };
}

export default useTooltipData;
export type {TooltipRow};

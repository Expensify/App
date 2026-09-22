import type {ChartDataPoint, ChartSeries} from '@components/Charts/types';
import {getSeriesValue} from '@components/Charts/utils';

type TooltipRow = {
    /** Name of the series this row reads, left out by a chart plotting a single unnamed series */
    label?: string;

    /** The series' amount at the active point */
    amount: string;

    /** The amount's share of that series' own total across the plotted points */
    percentage: string;
};

type TooltipData = {
    /** The active point's label */
    title: string;

    rows: TooltipRow[];
};

function formatPercentage(value: number, total: number): string {
    const percent = total > 0 ? Math.round((Math.abs(value) / total) * 100) : 0;
    return percent < 1 ? '<1%' : `${percent}%`;
}

/**
 * Formats tooltip content for the active chart data point: one row per plotted series.
 * A series' percentage is measured against its own total, so each window is a share of itself.
 */
function useTooltipData(activeDataIndex: number, data: ChartDataPoint[], series: ChartSeries[], formatAmount: (value: number) => string): TooltipData | null {
    if (activeDataIndex < 0 || activeDataIndex >= data.length) {
        return null;
    }
    const dataPoint = data.at(activeDataIndex);
    if (!dataPoint) {
        return null;
    }

    return {
        title: dataPoint.label,
        rows: series.map((seriesItem) => {
            const seriesTotal = data.reduce((sum, point) => sum + Math.abs(getSeriesValue(point, seriesItem.key)), 0);
            const value = getSeriesValue(dataPoint, seriesItem.key);

            return {
                label: seriesItem.label,
                amount: formatAmount(value),
                percentage: formatPercentage(value, seriesTotal),
            };
        }),
    };
}

export default useTooltipData;
export type {TooltipRow};

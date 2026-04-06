import type {ChartDataPoint} from '@components/Charts/types';

type TooltipData = {
    label: string;
    amount: string;
    percentage: string;
};

/**
 * Formats tooltip content for the active chart data point.
 * Computes the display amount using the provided formatter and the percentage relative to all data points.
 */
function useTooltipData(activeDataIndex: number, data: ChartDataPoint[], formatAmount: (value: number) => string): TooltipData | null {
    const totalSum = data.reduce((sum, point) => sum + Math.abs(point.total), 0);

    if (activeDataIndex < 0 || activeDataIndex >= data.length) {
        return null;
    }
    const dataPoint = data.at(activeDataIndex);
    if (!dataPoint) {
        return null;
    }
    const percent = totalSum > 0 ? Math.round((Math.abs(dataPoint.total) / totalSum) * 100) : 0;
    return {
        label: dataPoint.label,
        amount: formatAmount(dataPoint.total),
        percentage: percent < 1 ? '<1%' : `${percent}%`,
    };
}

export {useTooltipData};
export type {TooltipData};

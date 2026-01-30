import {useMemo} from 'react';
import type {ChartDataPoint, YAxisUnitPosition} from '@components/Charts/types';

type TooltipData = {
    label: string;
    amount: string;
    percentage: string;
};

/**
 * Formats tooltip content for the active chart data point.
 * Computes the display amount (with optional currency unit) and the percentage relative to all data points.
 */
function useTooltipData(activeDataIndex: number, data: ChartDataPoint[], yAxisUnit?: string, yAxisUnitPosition?: YAxisUnitPosition): TooltipData | null {
    return useMemo(() => {
        if (activeDataIndex < 0 || activeDataIndex >= data.length) {
            return null;
        }
        const dataPoint = data.at(activeDataIndex);
        if (!dataPoint) {
            return null;
        }
        const formatted = dataPoint.total.toLocaleString();
        let formattedAmount = formatted;
        if (yAxisUnit) {
            // Add space for multi-character codes (e.g., "PLN 100") but not for symbols (e.g., "$100")
            const separator = yAxisUnit.length > 1 ? ' ' : '';
            formattedAmount = yAxisUnitPosition === 'left' ? `${yAxisUnit}${separator}${formatted}` : `${formatted}${separator}${yAxisUnit}`;
        }
        const totalSum = data.reduce((sum, point) => sum + Math.abs(point.total), 0);
        const percent = totalSum > 0 ? Math.round((Math.abs(dataPoint.total) / totalSum) * 100) : 0;
        return {
            label: dataPoint.label,
            amount: formattedAmount,
            percentage: percent < 1 ? '<1%' : `${percent}%`,
        };
    }, [activeDataIndex, data, yAxisUnit, yAxisUnitPosition]);
}

export {useTooltipData};
export type {TooltipData};

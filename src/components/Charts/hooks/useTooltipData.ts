import type {ChartDataPoint} from '@components/Charts/types';

import useLocalize from '@hooks/useLocalize';

import {formatPercentOfTotal} from '@libs/PercentageUtils';

type TooltipData = {
    label: string;
    amount: string;
    percentage?: string;
};

/**
 * Formats tooltip content for the active chart data point.
 * Computes the display amount using the provided formatter and reads the share of total spend off the point.
 */
function useTooltipData(activeDataIndex: number, data: ChartDataPoint[], formatAmount: (value: number) => string): TooltipData | null {
    const {preferredLocale} = useLocalize();

    if (activeDataIndex < 0 || activeDataIndex >= data.length) {
        return null;
    }
    const dataPoint = data.at(activeDataIndex);
    if (!dataPoint) {
        return null;
    }

    return {
        label: dataPoint.label,
        amount: formatAmount(dataPoint.total),
        percentage: dataPoint.percentOfTotal === undefined ? undefined : formatPercentOfTotal(dataPoint.percentOfTotal, dataPoint.total, preferredLocale),
    };
}

export default useTooltipData;

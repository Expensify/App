import type {ChartDataPoint, ChartSeries} from '@components/Charts/types';

import useLocalize from '@hooks/useLocalize';

import {formatPercentOfTotal} from '@libs/PercentageUtils';

type TooltipRow = {
    /** The series' key */
    key: string;

    /** Series name, absent for a single unnamed series */
    label?: string;

    /** The series' amount at the active point */
    amount: string;

    /** The amount's share of total spend, shown only when a single series is plotted */
    percentage?: string;
};

type TooltipData = {
    /** The active point's label */
    title: string;

    rows: TooltipRow[];
};

/**
 * Formats tooltip content for the active chart data point: one row per plotted series.
 * The share of total spend shows for a single series only, not when periods are compared.
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
        // A series with nothing at this point gets no row.
        rows: series.flatMap((seriesItem) => {
            const value = dataPoint.values[seriesItem.key];
            if (value === undefined) {
                return [];
            }

            return {
                key: seriesItem.key,
                label: dataPoint.seriesLabels?.[seriesItem.key],
                amount: formatAmount(value),
                percentage: series.length === 1 && dataPoint.percentOfTotal !== undefined ? formatPercentOfTotal(dataPoint.percentOfTotal, value, preferredLocale) : undefined,
            };
        }),
    };
}

export default useTooltipData;
export type {TooltipRow};

import type {ChartDataPoint, ChartSeries} from '@components/Charts/types';
import {getPrimaryValue} from '@components/Charts/utils';

import useLocalize from '@hooks/useLocalize';

import {formatPercentOfTotal} from '@libs/PercentageUtils';

import type {NonEmptyTuple} from 'type-fest';

type TooltipData = {
    label: string;
    amount: string;
    percentage?: string;
    expenseCount?: string;
};

/**
 * Formats tooltip content for the active chart data point.
 * Computes the display amount of the primary series using the provided formatter and reads the share of total spend and the expense count off the point.
 */
function useTooltipData(activeDataIndex: number, data: ChartDataPoint[], series: NonEmptyTuple<ChartSeries>, formatAmount: (value: number) => string): TooltipData | null {
    const {translate, preferredLocale} = useLocalize();

    if (activeDataIndex < 0 || activeDataIndex >= data.length) {
        return null;
    }
    const dataPoint = data.at(activeDataIndex);
    if (!dataPoint) {
        return null;
    }
    const [{key: primarySeriesKey}] = series;
    const value = getPrimaryValue(dataPoint, primarySeriesKey);

    return {
        label: dataPoint.label,
        amount: formatAmount(value),
        percentage: dataPoint.percentOfTotal === undefined ? undefined : formatPercentOfTotal(dataPoint.percentOfTotal, value, preferredLocale),
        expenseCount: dataPoint.count === undefined ? undefined : translate('iou.expenseCount', {count: dataPoint.count}),
    };
}

export default useTooltipData;

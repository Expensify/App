import type {ChartDataPoint, ChartSeries} from '@components/Charts/types';
import {getPrimaryValue} from '@components/Charts/utils';
import formatExpenseCount from '@components/Charts/utils/formatExpenseCount';
import getTooltipNote from '@components/Charts/utils/getTooltipNote';

import useLocalize from '@hooks/useLocalize';

import type {NonEmptyTuple} from 'type-fest';

type TooltipData = {
    label: string;
    value: string;
    note?: string;

    /** Line under the value: the expense count under an amount or the amount under an expense count */
    detail?: string;
};

/**
 * Formats tooltip content for the active chart data point.
 * Computes the display value of the primary series using the provided formatter and reads the note that follows it and the line under it off the point.
 */
function useTooltipData(activeDataIndex: number, data: ChartDataPoint[], series: NonEmptyTuple<ChartSeries>, formatAmount: (value: number) => string): TooltipData | null {
    const {translate, preferredLocale, numberFormat} = useLocalize();

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
        value: formatAmount(value),
        note: getTooltipNote(value, dataPoint.percentOfTotal, preferredLocale),
        detail: dataPoint.count === undefined ? dataPoint.seriesTotals?.[primarySeriesKey] : formatExpenseCount(dataPoint.count, translate, numberFormat),
    };
}

export default useTooltipData;

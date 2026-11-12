import type {ChartDataPoint, ChartSeries} from '@components/Charts/types';
import {getPrimaryValue} from '@components/Charts/utils';
import formatChartCount from '@components/Charts/utils/formatChartCount';
import type {TooltipValue} from '@components/Charts/utils/formatTooltipValue';
import type {SearchChartCountDimension} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';

import {formatPercentOfTotal} from '@libs/PercentageUtils';

import type {NonEmptyTuple} from 'type-fest';

type TooltipData = TooltipValue & {
    label: string;
};

/**
 * Formats the active point's primary value with its share of the total, and the other measure of its expenses:
 * the spend behind a count, or the count behind an amount.
 */
function useTooltipData(
    activeDataIndex: number,
    data: ChartDataPoint[],
    series: NonEmptyTuple<ChartSeries>,
    formatAmount: (value: number) => string,
    countDimension: SearchChartCountDimension,
): TooltipData | null {
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
        percentage: dataPoint.percentOfTotal === undefined ? undefined : formatPercentOfTotal(dataPoint.percentOfTotal, value, preferredLocale),
        secondaryValue:
            dataPoint.seriesTotals?.[primarySeriesKey] ?? (dataPoint.count === undefined ? undefined : formatChartCount(dataPoint.count, countDimension, translate, numberFormat)),
    };
}

export default useTooltipData;

import React from 'react';
import {PieChart} from '@components/Charts';
import type {ChartDataPoint} from '@components/Charts/types';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {convertToFrontendAmountAsInteger} from '@libs/CurrencyUtils';
import type {SearchChartProps} from './types';

function SearchPieChart({data, getLabel, getFilterQuery, onItemPress, isLoading, unit, unitPosition}: SearchChartProps) {
    // Transform grouped transaction data to PieChart format
    const {getCurrencyDecimals} = useCurrencyListActions();
    const chartData: ChartDataPoint[] = data.map((item) => {
        const currency = item.currency ?? 'USD';
        const decimals = getCurrencyDecimals(currency);
        const valueInDisplayUnits = convertToFrontendAmountAsInteger(item.total ?? 0, decimals);

        return {
            label: getLabel(item),
            total: valueInDisplayUnits,
        };
    });

    const handleSlicePress = (dataPoint: ChartDataPoint, index: number) => {
        if (!onItemPress) {
            return;
        }
        const item = data.at(index);
        if (!item) {
            return;
        }
        const filterQuery = getFilterQuery(item);
        onItemPress(filterQuery);
    };

    return (
        <PieChart
            data={chartData}
            isLoading={isLoading}
            onSlicePress={handleSlicePress}
            valueUnit={unit?.value}
            valueUnitPosition={unitPosition}
        />
    );
}

SearchPieChart.displayName = 'SearchPieChart';

export default SearchPieChart;

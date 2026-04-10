import React from 'react';
import {LineChart} from '@components/Charts';
import type {ChartDataPoint} from '@components/Charts';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {convertToFrontendAmountAsInteger} from '@libs/CurrencyUtils';
import type {SearchChartProps} from './types';

function SearchLineChart({data, getLabel, getFilterQuery, onItemPress, isLoading, unit, unitPosition}: SearchChartProps) {
    const {getCurrencyDecimals} = useCurrencyListActions();
    const chartData: ChartDataPoint[] = data.map((item) => {
        const currency = item.currency ?? 'USD';
        const decimals = getCurrencyDecimals(currency);
        const totalInDisplayUnits = convertToFrontendAmountAsInteger(item.total ?? 0, decimals);

        return {
            label: getLabel(item),
            total: totalInDisplayUnits,
        };
    });

    const handlePointPress = (dataPoint: ChartDataPoint, index: number) => {
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
        <LineChart
            data={chartData}
            isLoading={isLoading}
            onPointPress={handlePointPress}
            yAxisUnit={unit}
            yAxisUnitPosition={unitPosition}
        />
    );
}

export default SearchLineChart;

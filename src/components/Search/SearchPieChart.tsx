import React from 'react';
import {PieChart} from '@components/Charts';
import type {ChartDataPoint} from '@components/Charts/types';
import {convertToFrontendAmountAsInteger} from '@libs/CurrencyUtils';
import type {SearchChartProps} from './types';

function SearchPieChart({data, title, titleIcon, getLabel, getFilterQuery, onItemPress, isLoading, unit, unitPosition}: SearchChartProps) {
    // Transform grouped transaction data to PieChart format
    const chartData: ChartDataPoint[] = data.map((item) => {
        const currency = item.currency ?? 'USD';
        const valueInDisplayUnits = convertToFrontendAmountAsInteger(item.total ?? 0, currency);

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
            title={title}
            titleIcon={titleIcon}
            isLoading={isLoading}
            onSlicePress={handleSlicePress}
            valueUnit={unit?.value}
            valueUnitPosition={unitPosition}
        />
    );
}

SearchPieChart.displayName = 'SearchPieChart';

export default SearchPieChart;

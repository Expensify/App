import ChartWidthBox from '@components/Charts/ChartWidthBox';
import ChartReveal from '@components/Charts/components/ChartReveal';
import {getPieChartLoadingHeight} from '@components/Charts/utils/chartHeights';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type {PieChartProps} from './PieChartContent';

import PieChartContent from './PieChartContent';

function PieChart(props: PieChartProps) {
    const styles = useThemeStyles();

    if (!props.isLoading && props.data.length === 0) {
        return null;
    }

    return (
        <ChartWidthBox>
            {(chartWidth) => (
                <ChartReveal loadingHeight={getPieChartLoadingHeight(styles, props.shouldShowLegend)}>
                    <PieChartContent
                        {...props}
                        chartWidth={chartWidth}
                    />
                </ChartReveal>
            )}
        </ChartWidthBox>
    );
}

PieChart.displayName = 'PieChart';

export default PieChart;

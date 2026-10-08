import ChartWidthBox from '@components/Charts/ChartWidthBox';
import ChartReveal from '@components/Charts/components/ChartReveal';
import SkiaWebChart from '@components/Charts/SkiaWebChart';
import {getPieChartLoadingHeight} from '@components/Charts/utils/chartHeights';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

import type {PieChartProps} from './PieChartContent';

const getPieChartContent = () => import('./PieChartContent');

function PieChart(props: PieChartProps) {
    const styles = useThemeStyles();

    if (!props.isLoading && props.data.length === 0) {
        return null;
    }

    return (
        <ChartWidthBox>
            {(chartWidth) => (
                <ChartReveal loadingHeight={getPieChartLoadingHeight(styles, props.shouldShowLegend)}>
                    <SkiaWebChart
                        getComponent={getPieChartContent}
                        componentProps={{...props, chartWidth}}
                        shouldShowLoadingSpinner={false}
                    />
                </ChartReveal>
            )}
        </ChartWidthBox>
    );
}

PieChart.displayName = 'PieChart';

export default PieChart;

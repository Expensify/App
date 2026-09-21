import ActivityIndicator from '@components/ActivityIndicator';
import BAR_INNER_PADDING from '@components/Charts/barChartConstants';
import {ChartFontsProvider, useChartFontManager, useChartLabelFormats, useChartLabelLayout, useChartLabelMeasurements, useDynamicYDomain} from '@components/Charts/hooks';
import {calculateMinDomainPadding, getVerticalBarPlotBounds, getYAxisLabelWidth} from '@components/Charts/utils';
import {GLYPH_PADDING} from '@components/Charts/VictoryTheme';

import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {LayoutChangeEvent} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';

import type {CartesianChartProps, ChartDataPoint} from '..';

import HorizontalBarChart from './HorizontalBarChart';
import VerticalBarChart from './VerticalBarChart';

/** Extra pixel spacing between the chart boundary and the data range, applied per side (Victory's `domainPadding` prop)
 * We need bottom: 1 for proper display of the bottom label
 */
const BASE_DOMAIN_PADDING = {top: 32, bottom: 1, left: 0, right: 0};

type BarChartProps = CartesianChartProps & {
    onBarPress?: (dataPoint: ChartDataPoint, index: number) => void;

    /** When true, all bars use the same color. When false (default), each bar uses a different color from the palette. */
    useSingleColor?: boolean;
};

/**
 * Lays the category labels out under vertical bars — side by side, then rotated to 45° — and switches
 * to horizontal bars when they still don't fit, so the labels get room to render legibly.
 */
function BarChartContentBody({data, isLoading, yAxisUnit, yAxisUnitPosition = 'left', useSingleColor = false, onBarPress}: BarChartProps) {
    const styles = useThemeStyles();
    const fontManager = useChartFontManager();
    const [chartWidth, setChartWidth] = useState(0);

    const yAxisDomain = useDynamicYDomain(data);

    const handleBarPress = (index: number) => {
        if (index < 0 || index >= data.length) {
            return;
        }
        const dataPoint = data.at(index);
        if (dataPoint && onBarPress) {
            onBarPress(dataPoint, index);
        }
    };

    const handleLayout = (event: LayoutChangeEvent) => {
        setChartWidth(event.nativeEvent.layout.width);
    };

    const domainPadding = (() => {
        if (chartWidth === 0) {
            return BASE_DOMAIN_PADDING;
        }
        const horizontalPadding = calculateMinDomainPadding(chartWidth, data.length, BAR_INNER_PADDING);
        return {...BASE_DOMAIN_PADDING, left: horizontalPadding, right: horizontalPadding};
    })();

    const {formatValue} = useChartLabelFormats({
        data,
        unit: yAxisUnit,
        unitPosition: yAxisUnitPosition,
    });

    const measurements = useChartLabelMeasurements(data, fontManager, variables.iconSizeExtraSmall);

    // The label layout picks the orientation, so it's based on the vertical chart's plot bounds derived
    // from the container width — they stay available while the horizontal chart is the one mounted.
    const chartPaddingLeft = getYAxisLabelWidth(data, formatValue, fontManager, variables.iconSizeExtraSmall, BASE_DOMAIN_PADDING) + GLYPH_PADDING;
    const plotBounds = getVerticalBarPlotBounds(chartWidth, chartPaddingLeft);
    const totalDomainPadding = domainPadding.left + domainPadding.right;
    const paddingScale = plotBounds.width > 0 ? plotBounds.width / (plotBounds.width + totalDomainPadding) : 0;

    const labelLayout = useChartLabelLayout({
        data,
        fontManager,
        fontSize: variables.iconSizeExtraSmall,
        tickSpacing: plotBounds.width > 0 && data.length > 0 ? plotBounds.width / data.length : 0,
        labelAreaWidth: plotBounds.width,
        firstTickLeftSpace: plotBounds.left + domainPadding.left * paddingScale,
        lastTickRightSpace: chartWidth > 0 ? chartWidth - plotBounds.right + domainPadding.right * paddingScale : 0,
        measurements,
        canFallBackToHorizontalBars: true,
    });

    if (isLoading || !fontManager) {
        return (
            <View style={styles.chartActivityIndicator}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (data.length === 0) {
        return null;
    }

    if (labelLayout.shouldUseHorizontalBars) {
        return (
            <HorizontalBarChart
                data={data}
                chartWidth={chartWidth}
                onLayout={handleLayout}
                fontManager={fontManager}
                formatValue={formatValue}
                valueAxisDomain={yAxisDomain}
                useSingleColor={useSingleColor}
                onBarPress={handleBarPress}
                labelWidths={measurements.labelWidths}
                ellipsisWidth={measurements.ellipsisWidth}
            />
        );
    }

    return (
        <VerticalBarChart
            data={data}
            chartWidth={chartWidth}
            onLayout={handleLayout}
            fontManager={fontManager}
            formatValue={formatValue}
            yAxisDomain={yAxisDomain}
            useSingleColor={useSingleColor}
            onBarPress={handleBarPress}
            labelLayout={labelLayout}
            labelWidths={measurements.labelWidths}
            domainPadding={domainPadding}
            chartPaddingLeft={chartPaddingLeft}
        />
    );
}

function BarChartContent(props: BarChartProps) {
    return (
        <ChartFontsProvider>
            <BarChartContentBody {...props} />
        </ChartFontsProvider>
    );
}

export default BarChartContent;
export type {BarChartProps};

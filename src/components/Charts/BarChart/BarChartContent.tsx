import ActivityIndicator from '@components/ActivityIndicator';
import BAR_INNER_PADDING from '@components/Charts/barChartConstants';
import {ChartFontsProvider, useChartFontManager, useChartLabelFormats, useChartLabelLayout, useChartLabelMeasurements, useDynamicYDomain} from '@components/Charts/hooks';
import {estimateVerticalBarChartGeometry, truncateCategoryLabels, VERTICAL_BAR_BASE_DOMAIN_PADDING} from '@components/Charts/utils';

import useThemeStyles from '@hooks/useThemeStyles';

import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import variables from '@styles/variables';

import type {LayoutChangeEvent} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';

import type {CartesianChartProps, ChartDataPoint} from '..';

import HorizontalBarChart from './HorizontalBarChart';
import VerticalBarChart from './VerticalBarChart';

/** Extra pixel spacing between the chart boundary and the data range, applied per side (Victory's `domainPadding` prop) */
const BASE_DOMAIN_PADDING = VERTICAL_BAR_BASE_DOMAIN_PADDING;

type BarChartProps = CartesianChartProps & {
    /** Callback when a bar is pressed */
    onBarPress?: (dataPoint: ChartDataPoint, index: number) => void;

    /** When true, all bars use the same color. When false (default), each bar uses a different color from the palette. */
    useSingleColor?: boolean;
};

/**
 * Decides between vertical and horizontal bar orientation based on measured label layout,
 * then delegates rendering to the matching orientation-specific component.
 */
function BarChartContentBody({data, isLoading, yAxisUnit, yAxisUnitPosition = 'left', useSingleColor = false, onBarPress}: BarChartProps) {
    const styles = useThemeStyles();
    const fontManager = useChartFontManager();
    const [chartWidth, setChartWidth] = useState(0);

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

    const {formatValue} = useChartLabelFormats({
        data,
        unit: yAxisUnit,
        unitPosition: yAxisUnitPosition,
    });

    const yAxisDomain = useDynamicYDomain(data);

    const orientationGeometry = estimateVerticalBarChartGeometry(chartWidth, data, fontManager, variables.iconSizeExtraSmall, formatValue, BAR_INNER_PADDING, BASE_DOMAIN_PADDING);
    const {barAreaWidth: orientationBarAreaWidth, boundsLeft: orientationBoundsLeft, boundsRight: orientationBoundsRight, domainPadding} = orientationGeometry;

    const totalDomainPadding = domainPadding.left + domainPadding.right;
    const paddingScale = orientationBarAreaWidth > 0 ? orientationBarAreaWidth / (orientationBarAreaWidth + totalDomainPadding) : 0;

    const originalLabels = data.map((p) => p.label);
    const measurements = useChartLabelMeasurements(data, fontManager, variables.iconSizeExtraSmall);

    // Computed here (rather than in VerticalBarChart/HorizontalBarChart) because its `shouldUseHorizontalBars`
    // output is what decides which orientation-specific component to render below.
    const labelLayout = useChartLabelLayout({
        data,
        fontManager,
        fontSize: variables.iconSizeExtraSmall,
        tickSpacing: orientationBarAreaWidth > 0 ? orientationBarAreaWidth / data.length : 0,
        labelAreaWidth: orientationBarAreaWidth,
        firstTickLeftSpace: orientationBoundsLeft + domainPadding.left * paddingScale,
        lastTickRightSpace: chartWidth > 0 ? chartWidth - orientationBoundsRight + domainPadding.right * paddingScale : 0,
        measurements,
        preferHorizontalBars: true,
    });

    const truncatedCategoryLabels = truncateCategoryLabels(originalLabels, measurements.labelWidths, measurements.ellipsisWidth);

    if (isLoading || !fontManager) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'BarChartContent',
            isLoading,
            isFontLoading: !fontManager,
        };
        return (
            <View style={styles.chartActivityIndicator}>
                <ActivityIndicator
                    size="large"
                    reasonAttributes={reasonAttributes}
                />
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
                yAxisDomain={yAxisDomain}
                useSingleColor={useSingleColor}
                onBarPress={handleBarPress}
                truncatedCategoryLabels={truncatedCategoryLabels}
                ellipsisWidth={labelLayout.ellipsisWidth}
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
            originalLabels={originalLabels}
            labelWidths={measurements.labelWidths}
            domainPadding={domainPadding}
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

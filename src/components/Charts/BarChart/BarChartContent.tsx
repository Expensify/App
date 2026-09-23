import ActivityIndicator from '@components/ActivityIndicator';
import BAR_INNER_PADDING from '@components/Charts/barChartConstants';
import ChartLegend from '@components/Charts/components/ChartLegend';
import {ChartFontsProvider, useChartFontManager, useChartLabelFormats, useChartLabelLayout, useChartLabelMeasurements, useDynamicYDomain} from '@components/Charts/hooks';
import {calculateMinDomainPadding, getPointValues, getSeriesValue, getVerticalBarPlotBounds, getYAxisLabelWidth} from '@components/Charts/utils';
import {GLYPH_PADDING} from '@components/Charts/VictoryTheme';

import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {LayoutChangeEvent} from 'react-native';
import type {CartesianChartRenderArg, ChartBounds, Scale} from 'victory-native';

import React, {useState} from 'react';
import {View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {BarGroup, CartesianChart} from 'victory-native';

import type {CartesianChartProps, ChartDataPoint} from '..';

import HorizontalBarChart from './HorizontalBarChart';
import VerticalBarChart from './VerticalBarChart';

/** Extra pixel spacing between the chart boundary and the data range, applied per side (Victory's `domainPadding` prop)
 * We need bottom: 1 for proper display of the bottom label
 */
const BASE_DOMAIN_PADDING = {top: 32, bottom: 1, left: 0, right: 0};

/** Gap between the bars of one group, as a share of a bar's width */
const BAR_WITHIN_GROUP_PADDING = 0.1;

/** Only the end carrying the value is rounded; victory-native flips these for a bar that hangs below the axis. */
const BAR_ROUNDED_CORNERS = {topLeft: 8, topRight: 8, bottomLeft: 0, bottomRight: 0};

/** A point as victory-native reads it: the x index plus one entry per series, keyed by the series' key. */
type BarChartDatum = Record<string, number>;

type BarChartProps = CartesianChartProps & {
    /** Called with the pressed point and the series whose bar was pressed */
    onBarPress?: (dataPoint: ChartDataPoint, index: number, seriesKey: string) => void;
};

/**
 * Lays the category labels out under vertical bars — side by side, then rotated to 45° — and switches
 * to horizontal bars when they still don't fit, so the labels get room to render legibly.
 */
function BarChartContentBody({data, series, isLoading, yAxisUnit, yAxisUnitPosition = 'left', onBarPress}: BarChartProps) {
    const styles = useThemeStyles();
    const fontManager = useChartFontManager();
    const [chartWidth, setChartWidth] = useState(0);
    const [barAreaWidth, setBarAreaWidth] = useState(0);
    const [boundsLeft, setBoundsLeft] = useState(0);
    const [boundsRight, setBoundsRight] = useState(0);

    const seriesKeys = series.map((seriesItem) => seriesItem.key);
    const primarySeriesKey = seriesKeys.at(0) ?? '';
    const chartData: BarChartDatum[] = data.map((point, index) => ({
        x: index,
        ...Object.fromEntries(seriesKeys.map((key) => [key, getSeriesValue(point, key)])),
    }));

    const yAxisDomain = useDynamicYDomain(data);

    /** Width of a single bar and of the whole group of bars at one x position, as BarGroup lays them out. */
    const barWidth = useSharedValue(0);
    const groupWidth = useSharedValue(0);

    /** Canvas x position of each group's center, so a press can be traced back to the bar under the cursor. */
    const groupCenters = useSharedValue<number[]>([]);

    /** The series whose bar sits under `cursorX`, resolved from the group's left edge. */
    const resolveSeriesKey = (index: number, cursorX: number): string => {
        const groupCenter = groupCenters.get().at(index);
        const width = barWidth.get();
        if (groupCenter === undefined || width === 0) {
            return primarySeriesKey;
        }
        const offset = cursorX - (groupCenter - groupWidth.get() / 2);
        const seriesIndex = Math.min(seriesKeys.length - 1, Math.max(0, Math.floor(offset / width)));
        return seriesKeys.at(seriesIndex) ?? primarySeriesKey;
    };

    const handleBarPress = (index: number, cursor: {x: number; y: number}) => {
        if (index < 0 || index >= data.length) {
            return;
        }
        const dataPoint = data.at(index);
        if (dataPoint && onBarPress) {
            onBarPress(dataPoint, index, resolveSeriesKey(index, cursor.x));
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
                color={color}
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
            color={color}
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

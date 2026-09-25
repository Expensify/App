import BAR_INNER_PADDING from '@components/Charts/barChartConstants';
import {ChartFontsProvider, useChartFontManager, useChartLabelFormats, useChartLabelLayout, useChartLabelMeasurements} from '@components/Charts/hooks';
import {calculateMinDomainPadding, getVerticalBarPlotBounds, getYAxisLabelWidth} from '@components/Charts/utils';
import {GLYPH_PADDING} from '@components/Charts/VictoryTheme';

import variables from '@styles/variables';

import type {LayoutChangeEvent} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';

import type {BarChartContentProps} from './types';

import HorizontalBarChartContentBody from './HorizontalBarChartContent';
import VerticalBarChartContentBody from './VerticalBarChartContent';

const FONT_SIZE = variables.iconSizeExtraSmall;

// Mirrors the vertical chart's domain padding, to predict the y-axis label gutter (and thus the plot width).
const BASE_DOMAIN_PADDING = {top: 32, bottom: 1};

/**
 * Resolves the bar chart orientation on every layout change and renders the matching body. Wide layouts pass
 * `isHorizontal`. Narrow layouts predict the vertical chart's label fit from the container width, so the chart
 * switches to horizontal bars when labels don't fit even at 45° and back to vertical when the container grows.
 */
function BarChartOrientationDispatcher({isHorizontal = false, canFallBackToHorizontalBars = false, ...props}: BarChartContentProps) {
    const fontManager = useChartFontManager();
    const [containerWidth, setContainerWidth] = useState(0);
    const {data, yAxisUnit, yAxisUnitPosition = 'left'} = props;

    const {formatValue} = useChartLabelFormats({data, unit: yAxisUnit, unitPosition: yAxisUnitPosition});
    const measurements = useChartLabelMeasurements(data, fontManager, FONT_SIZE);

    // Predict the vertical chart's plot geometry from the container width so the fit decision matches what it would measure after mounting.
    const yAxisLabelWidth = getYAxisLabelWidth(data, formatValue, fontManager, FONT_SIZE, BASE_DOMAIN_PADDING);
    const plotBounds = getVerticalBarPlotBounds(containerWidth, yAxisLabelWidth + GLYPH_PADDING);
    const domainPadding = containerWidth > 0 && data.length > 0 ? calculateMinDomainPadding(containerWidth, data.length, BAR_INNER_PADDING) : 0;
    const paddingScale = plotBounds.width > 0 ? plotBounds.width / (plotBounds.width + 2 * domainPadding) : 0;

    const {shouldUseHorizontalBars} = useChartLabelLayout({
        data,
        fontManager,
        fontSize: FONT_SIZE,
        tickSpacing: plotBounds.width > 0 && data.length > 0 ? plotBounds.width / data.length : 0,
        labelAreaWidth: plotBounds.width,
        firstTickLeftSpace: plotBounds.left + domainPadding * paddingScale,
        lastTickRightSpace: containerWidth > 0 ? containerWidth - plotBounds.right + domainPadding * paddingScale : 0,
        measurements,
        canFallBackToHorizontalBars,
    });

    const renderHorizontal = isHorizontal || shouldUseHorizontalBars;

    const handleLayout = (event: LayoutChangeEvent) => {
        setContainerWidth(event.nativeEvent.layout.width);
    };

    return <View onLayout={handleLayout}>{renderHorizontal ? <HorizontalBarChartContentBody {...props} /> : <VerticalBarChartContentBody {...props} />}</View>;
}

function BarChartContent(props: BarChartContentProps) {
    return (
        <ChartFontsProvider>
            <BarChartOrientationDispatcher {...props} />
        </ChartFontsProvider>
    );
}

export default BarChartContent;

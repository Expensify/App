import BAR_INNER_PADDING, {VERTICAL_BAR_DOMAIN_PADDING} from '@components/Charts/barChartConstants';
import {ChartFontsProvider, useChartFontManager, useChartLabelFormats, useChartLabelLayout, useChartLabelMeasurements} from '@components/Charts/hooks';
import {getVerticalBarLabelLayoutInputs, getVerticalBarPlotBounds, getYAxisLabelWidth} from '@components/Charts/utils';
import {GLYPH_PADDING, LABEL_ROTATIONS} from '@components/Charts/VictoryTheme';

import variables from '@styles/variables';

import type {LayoutChangeEvent} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';

import type {BarChartContentProps} from './types';

import HorizontalBarChartContentBody from './HorizontalBarChartContent';
import VerticalBarChartContentBody from './VerticalBarChartContent';

const FONT_SIZE = variables.iconSizeExtraSmall;

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
    const yAxisLabelWidth = getYAxisLabelWidth(data, formatValue, fontManager, FONT_SIZE, VERTICAL_BAR_DOMAIN_PADDING);
    const plotBounds = getVerticalBarPlotBounds(containerWidth, yAxisLabelWidth + GLYPH_PADDING);

    const {labelRotation} = useChartLabelLayout({
        data,
        fontManager,
        fontSize: FONT_SIZE,
        measurements,
        ...getVerticalBarLabelLayoutInputs({
            containerWidth,
            plotLeft: plotBounds.left,
            plotRight: plotBounds.right,
            plotWidth: plotBounds.width,
            dataLength: data.length,
            innerPadding: BAR_INNER_PADDING,
        }),
    });

    const renderHorizontal = isHorizontal || (canFallBackToHorizontalBars && labelRotation === LABEL_ROTATIONS.VERTICAL);

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

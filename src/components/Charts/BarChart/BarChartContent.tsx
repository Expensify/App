import BAR_INNER_PADDING, {VERTICAL_BAR_DOMAIN_PADDING} from '@components/Charts/barChartConstants';
import {ChartFontsProvider, useChartFontManager, useChartLabelFormats, useChartLabelLayout, useChartLabelMeasurements} from '@components/Charts/hooks';
import {getVerticalBarLabelLayoutInputs, getCartesianPlotBounds, getYAxisLabelWidth} from '@components/Charts/utils';
import {GLYPH_PADDING, LABEL_ROTATIONS} from '@components/Charts/VictoryTheme';

import variables from '@styles/variables';

import React from 'react';

import type {BarChartContentProps} from './types';

import HorizontalBarChartContentBody from './HorizontalBarChartContent';
import VerticalBarChartContentBody from './VerticalBarChartContent';

const FONT_SIZE = variables.iconSizeExtraSmall;

function BarChartOrientationDispatcher({isHorizontal = false, canFallBackToHorizontalBars = false, ...props}: BarChartContentProps) {
    const fontManager = useChartFontManager();
    const {data, yAxisUnit, yAxisUnitPosition = 'left', chartWidth} = props;

    const {formatCompactValue} = useChartLabelFormats({data, unit: yAxisUnit, unitPosition: yAxisUnitPosition});
    const measurements = useChartLabelMeasurements(data, fontManager, FONT_SIZE);

    // Predict the vertical chart's plot geometry from the container width so the fit decision matches the geometry the vertical chart lays its labels out with.
    const yAxisLabelWidth = getYAxisLabelWidth(data, formatCompactValue, fontManager, FONT_SIZE, VERTICAL_BAR_DOMAIN_PADDING);
    const plotBounds = getCartesianPlotBounds(chartWidth, yAxisLabelWidth + GLYPH_PADDING);

    const {labelRotation} = useChartLabelLayout({
        data,
        fontManager,
        fontSize: FONT_SIZE,
        measurements,
        ...getVerticalBarLabelLayoutInputs({
            containerWidth: chartWidth,
            plotLeft: plotBounds.left,
            plotRight: plotBounds.right,
            plotWidth: plotBounds.width,
            dataLength: data.length,
            innerPadding: BAR_INNER_PADDING,
        }),
    });

    const renderHorizontal = isHorizontal || (canFallBackToHorizontalBars && labelRotation === LABEL_ROTATIONS.VERTICAL);

    return renderHorizontal ? <HorizontalBarChartContentBody {...props} /> : <VerticalBarChartContentBody {...props} />;
}

function BarChartContent(props: BarChartContentProps) {
    return (
        <ChartFontsProvider>
            <BarChartOrientationDispatcher {...props} />
        </ChartFontsProvider>
    );
}

export default BarChartContent;

import type {LabelItem} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import convertDegreeToRadian from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/convertDegreeToRadian';

import type {Color} from '@shopify/react-native-skia';
import type {PieSliceData} from 'victory-native';

import React from 'react';

import VictoryChartLabel from './VictoryChartLabel';
import VictoryChartPieLabelIndicator from './VictoryChartPieLabelIndicator';

type VictoryChartPieLabelProps = {
    slice: PieSliceData;
    baseLabelItem: LabelItem;
    label: string;
    labelRadius: number | undefined;
    labelIndicatorXShift: number | undefined;
    labelIndicatorYShift: number | undefined;
    labelIndicatorStroke: Color | undefined;
    labelIndicatorStrokeWidth: number | undefined;
    labelIndicatorInnerOffset: number | undefined;
    labelIndicatorOuterOffset: number | undefined;
};

function VictoryChartPieLabel({
    slice,
    baseLabelItem,
    label,
    labelRadius,
    labelIndicatorXShift,
    labelIndicatorYShift,
    labelIndicatorStroke,
    labelIndicatorStrokeWidth,
    labelIndicatorInnerOffset,
    labelIndicatorOuterOffset,
}: VictoryChartPieLabelProps) {
    const midAngle = convertDegreeToRadian((slice.startAngle + slice.endAngle) / 2);
    const x = Math.round(slice.center.x + (labelRadius ?? slice.radius) * Math.cos(midAngle));
    const y = Math.round(slice.center.y + (labelRadius ?? slice.radius) * Math.sin(midAngle));

    const labelItem: LabelItem = {
        ...baseLabelItem,
        text: label,
        x,
        y,
        textAnchor: 'middle',
        verticalAnchor: 'middle',
    };

    return (
        <>
            {!!labelIndicatorStrokeWidth && (
                <VictoryChartPieLabelIndicator
                    slice={slice}
                    labelRadius={labelRadius ?? slice.radius}
                    labelIndicatorXShift={labelIndicatorXShift}
                    labelIndicatorYShift={labelIndicatorYShift}
                    labelIndicatorStroke={labelIndicatorStroke}
                    labelIndicatorStrokeWidth={labelIndicatorStrokeWidth}
                    labelIndicatorInnerOffset={labelIndicatorInnerOffset}
                    labelIndicatorOuterOffset={labelIndicatorOuterOffset}
                />
            )}
            <VictoryChartLabel {...labelItem} />
        </>
    );
}

export default VictoryChartPieLabel;

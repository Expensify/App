import type {LabelItem, TextAnchor} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

import type {Color} from '@shopify/react-native-skia';
import type {PieSliceData} from 'victory-native';

import React from 'react';

import VictoryChartLabel from './VictoryChartLabel';
import VictoryChartPieLabelIndicator from './VictoryChartPieLabelIndicator';

type ResolvedPieLabel = {
    x: number;
    y: number;
    textAnchor: TextAnchor;
};

type VictoryChartPieLabelProps = {
    slice: PieSliceData;
    baseLabelItem: LabelItem;
    label: string;
    resolvedLabel: ResolvedPieLabel;
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
    resolvedLabel,
    labelRadius,
    labelIndicatorXShift,
    labelIndicatorYShift,
    labelIndicatorStroke,
    labelIndicatorStrokeWidth,
    labelIndicatorInnerOffset,
    labelIndicatorOuterOffset,
}: VictoryChartPieLabelProps) {
    const labelItem: LabelItem = {
        ...baseLabelItem,
        text: label,
        x: resolvedLabel.x,
        y: resolvedLabel.y,
        textAnchor: resolvedLabel.textAnchor,
        verticalAnchor: 'middle',
    };

    return (
        <>
            {!!labelIndicatorStrokeWidth && (
                <VictoryChartPieLabelIndicator
                    slice={slice}
                    labelRadius={labelRadius ?? slice.radius}
                    resolvedLabel={resolvedLabel}
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

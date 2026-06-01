import React from 'react';
import type {PieSliceData} from 'victory-native';
import type {LabelItem} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import VictoryChartLabel from './VictoryChartLabel';
import VictoryChartPieLabelIndicator from './VictoryChartPieLabelIndicator';

type VictoryChartPieLabelProps = {
    slice: PieSliceData;
    baseLabelItem: LabelItem;
    label: string | undefined;
    labelRadius: number | undefined;
    labelIndicatorInnerOffset: number | undefined;
    labelIndicatorOuterOffset: number | undefined;
};

const RADIAN = Math.PI / 180;

function VictoryChartPieLabel({slice, baseLabelItem, label, labelRadius, labelIndicatorInnerOffset, labelIndicatorOuterOffset}: VictoryChartPieLabelProps) {
    const text = label ?? slice.label;
    const midAngle = (slice.startAngle + slice.endAngle) / 2;
    const x = slice.center.x + (labelRadius ?? slice.radius) * Math.cos(-midAngle * RADIAN);
    const y = slice.center.y + (labelRadius ?? slice.radius) * Math.sin(midAngle * RADIAN);

    const labelItem: LabelItem = {
        ...baseLabelItem,
        text,
        x,
        y,
        textAnchor: 'middle',
    };

    return (
        <>
            <VictoryChartPieLabelIndicator
                slice={slice}
                labelRadius={labelRadius ?? slice.radius}
                labelIndicatorInnerOffset={labelIndicatorInnerOffset}
                labelIndicatorOuterOffset={labelIndicatorOuterOffset}
            />
            <VictoryChartLabel {...labelItem} />
        </>
    );
}

VictoryChartPieLabel.displayName = 'VictoryChartPieLabel';

export default VictoryChartPieLabel;

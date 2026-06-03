import React from 'react';
import type {PieSliceData} from 'victory-native';
import type {LabelItem} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import VictoryChartLabel from './VictoryChartLabel';

type VictoryChartPieLabelProps = {
    slice: PieSliceData;
    labelItemTemplate?: LabelItem;
    dataLabels: Array<string | number>;
    labels?: string[];
    labelRadius?: number;
};

const RADIAN = Math.PI / 180;

/**
 * Renders a pie slice label inside the Skia canvas. Must not use React context hooks
 * because this runs in victory-native's pie slice render callback.
 */
function VictoryChartPieLabel({slice, labelItemTemplate, dataLabels, labels, labelRadius}: VictoryChartPieLabelProps) {
    if (!labelItemTemplate) {
        return null;
    }

    const text = labels?.[dataLabels.indexOf(slice.label)] ?? slice.label;
    const resolvedLabelRadius = labelRadius ?? slice.radius;
    const midAngle = (slice.startAngle + slice.endAngle) / 2;
    const x = slice.center.x + resolvedLabelRadius * Math.cos(-midAngle * RADIAN);
    const y = slice.center.y + resolvedLabelRadius * Math.sin(midAngle * RADIAN);

    const labelItem: LabelItem = {
        ...labelItemTemplate,
        text,
        x,
        y,
        textAnchor: 'middle',
    };

    return <VictoryChartLabel {...labelItem} />;
}

export default VictoryChartPieLabel;

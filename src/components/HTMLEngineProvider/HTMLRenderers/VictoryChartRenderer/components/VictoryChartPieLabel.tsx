import React from 'react';
import type {TNode} from 'react-native-render-html';
import type {PieSliceData} from 'victory-native';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import type {LabelItem, PolarChartData} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import VictoryChartLabel from './VictoryChartLabel';

type VictoryChartPieLabelProps = {
    tnode: TNode;
    slice: PieSliceData;
    labelItemTemplate?: LabelItem;
};

const RADIAN = Math.PI / 180;

function VictoryChartPieLabel({tnode, slice, labelItemTemplate}: VictoryChartPieLabelProps) {
    const {data} = useVictoryChartContext();

    if (!labelItemTemplate) {
        return null;
    }

    const dataLabels = Object.values(data).map((entry) => (entry as PolarChartData).label);
    const labels = parseAttribute<string[]>(tnode.attributes.labels);
    const text = labels?.[dataLabels.indexOf(slice.label)] ?? slice.label;

    const labelRadius = tnode.attributes.labelradius !== undefined ? Number(parseAttribute(tnode.attributes.labelradius)) : slice.radius;
    const midAngle = (slice.startAngle + slice.endAngle) / 2;
    const x = slice.center.x + labelRadius * Math.cos(-midAngle * RADIAN);
    const y = slice.center.y + labelRadius * Math.sin(midAngle * RADIAN);

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

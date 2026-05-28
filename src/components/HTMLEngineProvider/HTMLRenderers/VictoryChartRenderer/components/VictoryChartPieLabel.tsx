import {Skia} from '@shopify/react-native-skia';
import {parseDocument} from 'htmlparser2';
import React from 'react';
import {type TNode, useAmbientTRenderEngine} from 'react-native-render-html';
import {Pie, PolarChart} from 'victory-native';
import type {PieSliceData} from 'victory-native';
import {useChartDefaultTypeface} from '@components/Charts/hooks';
import {COLOR_KEY, LABEL_KEY, VALUE_KEY, X_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import type {ChartType, PolarChartData, ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseComponent from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseComponent';
import parseVictoryLabelNode from '../parsers/victoryLabelParser';
import VictoryChartLabel from './VictoryChartLabel';

type VictoryChartPieLabelProps = {
    tnode: TNode;
    slice: PieSliceData;
};

const RADIAN = Math.PI / 180;

function VictoryChartPieLabel({tnode, slice}: VictoryChartPieLabelProps) {
    const {data} = useVictoryChartContext();
    const renderEngine = useAmbientTRenderEngine();
    const labelComponentNode = parseComponent(tnode.attributes.labelcomponent, renderEngine, 'victorylabel');
    const labelItem = labelComponentNode ? parseVictoryLabelNode(labelComponentNode).labelItems?.at(0) : undefined;

    if (!labelItem) {
        return null;
    }

    const dataLabels = Object.values(data).map((entry) => (entry as PolarChartData).label);
    const labels = parseAttribute<string[]>(tnode.attributes.labels);
    const text = labels?.at(dataLabels.indexOf(slice.label)) ?? slice.label;

    const labelRadius = tnode.attributes.labelradius !== undefined ? Number(parseAttribute(tnode.attributes.labelradius)) : slice.radius;
    const midAngle = (slice.startAngle + slice.endAngle) / 2;
    const x = slice.center.x + labelRadius * Math.cos(-midAngle * RADIAN);
    const y = slice.center.y + labelRadius * Math.sin(midAngle * RADIAN);

    labelItem.text = text;
    labelItem.x = x;
    labelItem.y = y;

    return <VictoryChartLabel {...labelItem} />;
}

VictoryChartPieLabel.displayName = 'VictoryChartPieLabel';

export default VictoryChartPieLabel;

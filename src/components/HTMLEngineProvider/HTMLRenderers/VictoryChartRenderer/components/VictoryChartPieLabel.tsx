import {Skia} from '@shopify/react-native-skia';
import {parseDocument} from 'htmlparser2';
import React from 'react';
import {type TNode, useAmbientTRenderEngine} from 'react-native-render-html';
import {Pie, PolarChart} from 'victory-native';
import type {PieSliceData} from 'victory-native';
import {useChartDefaultTypeface} from '@components/Charts/hooks';
import {COLOR_KEY, LABEL_KEY, VALUE_KEY, X_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseVictoryLabelNode from '../parsers/victoryLabelParser';
import VictoryChartLabels from './VictoryChartLabels';

type VictoryChartPieLabelProps = {
    tnode: TNode;
    slice: PieSliceData;
};

const RADIAN = Math.PI / 180;

function VictoryChartPieLabel({tnode, slice}: VictoryChartPieLabelProps) {
    const renderEnginer = useAmbientTRenderEngine();

    if (!tnode.attributes.labelcomponent) {
        return null;
    }

    const labelComponentTree = renderEnginer.buildTTree(tnode.attributes.labelcomponent);
    const labelComponentNode =
        labelComponentTree.children.at(0)?.children.at(0)?.children.at(0)?.tagName === 'victorylabel' ? labelComponentTree.children.at(0)?.children.at(0)?.children.at(0) : null;

    if (!labelComponentNode) {
        return null;
    }

    const {labelItems} = parseVictoryLabelNode(labelComponentNode);

    if (!labelItems?.length) {
        return null;
    }

    // Offset from the slice radius to help position the label
    const labelRadius = tnode.attributes.labelradius !== undefined ? Number(parseAttribute(tnode.attributes.labelradius)) : slice.radius;

    // Middle angle of the slice
    const midAngle = (slice.startAngle + slice.endAngle) / 2;

    // Center coordinates of slice
    const text = slice.label;
    const x = slice.center.x + labelRadius * Math.cos(-midAngle * RADIAN);
    const y = slice.center.y + labelRadius * Math.sin(midAngle * RADIAN);

    labelItems.at(0).text = text;
    labelItems.at(0).x = x;
    labelItems.at(0).y = y;

    return <VictoryChartLabels labelItems={labelItems} />;
}

VictoryChartPieLabel.displayName = 'VictoryChartPieLabel';

export default VictoryChartPieLabel;

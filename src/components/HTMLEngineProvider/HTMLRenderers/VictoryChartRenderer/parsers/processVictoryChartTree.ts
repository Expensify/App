import type {SkTypeface} from '@shopify/react-native-skia';
import lodashMerge from 'lodash/merge';
import type {TNode} from 'react-native-render-html';
import {X_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import type {ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import PARSER_REGISTRY from './parserRegistry';

/**
 * Recursively walk the HTML tnode tree, dispatching each node to its registered parser
 * and merging the results into a single chart config.
 */
function processVictoryChartTree(tnode: TNode, typeface: SkTypeface | null): ProcessNodeResult {
    const data: ProcessNodeResult['data'] = {};
    const yKeys: ProcessNodeResult['yKeys'] = [];
    let xAxis: ProcessNodeResult['xAxis'];
    let yAxis: ProcessNodeResult['yAxis'];
    const labelItems: ProcessNodeResult['labelItems'] = [];
    const legendItems: ProcessNodeResult['legendItems'] = [];

    const parser = PARSER_REGISTRY[tnode.tagName ?? ''];
    if (parser) {
        const result = parser(tnode, typeface);
        if (result.data) {
            lodashMerge(data, result.data);
        }
        if (result.yKeys) {
            yKeys.push(...result.yKeys);
        }
        if (result.xAxis) {
            xAxis = result.xAxis;
        }
        if (result.yAxis?.length) {
            yAxis = [...(yAxis ?? []), ...result.yAxis];
        }
        if (result.labelItems) {
            labelItems.push(...result.labelItems);
        }
        if (result.legendItems) {
            legendItems.push(...result.legendItems);
        }
    }

    for (const child of tnode.children) {
        const childResult = processVictoryChartTree(child, typeface);
        yKeys.push(...childResult.yKeys);
        if (childResult.xAxis) {
            // Safe to replace — there should be at most one xAxis per chart
            xAxis = childResult.xAxis;
        }
        if (childResult.yAxis?.length) {
            yAxis = [...(yAxis ?? []), ...childResult.yAxis];
        }
        labelItems.push(...childResult.labelItems);
        legendItems.push(...childResult.legendItems);
        lodashMerge(data, childResult.data);
    }

    return {data, xKey: X_KEY, yKeys, xAxis, yAxis, labelItems, legendItems};
}

export default processVictoryChartTree;

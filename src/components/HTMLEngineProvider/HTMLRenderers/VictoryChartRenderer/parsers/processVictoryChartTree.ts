import {X_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import type {ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import adjustHorizontalChartPadding from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/adjustHorizontalChartPadding';
import adjustVerticalChartPadding from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/adjustVerticalChartPadding';

import type {SkTypeface} from '@shopify/react-native-skia';
import type {TNode} from 'react-native-render-html';

import lodashMerge from 'lodash/merge';

import PARSER_REGISTRY from './parserRegistry';

/**
 * Recursively walk the HTML tnode tree, dispatching each node to its registered parser
 * and merging the results into a single chart config.
 */
function processVictoryChartTree(tnode: TNode, typeface: SkTypeface | null, rootProcessedResult: ProcessNodeResult | null): ProcessNodeResult {
    const data: ProcessNodeResult['data'] = {};
    const yKeys: ProcessNodeResult['yKeys'] = [];
    let xAxis: ProcessNodeResult['xAxis'];
    let yAxis: ProcessNodeResult['yAxis'];
    let domain: ProcessNodeResult['domain'];
    let domainPadding: ProcessNodeResult['domainPadding'];
    let padding: ProcessNodeResult['padding'];
    let isHorizontal: ProcessNodeResult['isHorizontal'];
    let categories: ProcessNodeResult['categories'];
    const labelItems: ProcessNodeResult['labelItems'] = [];
    const legendItems: ProcessNodeResult['legendItems'] = [];
    let barWidth: ProcessNodeResult['barWidth'];
    let barSeriesCount = tnode.tagName === 'victorybar' ? 1 : 0;

    const parser = PARSER_REGISTRY[tnode.tagName ?? ''];
    if (parser) {
        const result = parser(tnode, typeface, rootProcessedResult);
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
        if (result.domain) {
            domain = result.domain;
        }
        if (result.domainPadding) {
            domainPadding = result.domainPadding;
        }
        if (result.padding) {
            padding = result.padding;
        }
        if (result.isHorizontal) {
            isHorizontal = result.isHorizontal;
        }
        if (result.categories) {
            categories = result.categories;
        }
        if (result.labelItems) {
            labelItems.push(...result.labelItems);
        }
        if (result.legendItems) {
            legendItems.push(...result.legendItems);
        }
        if (result.barWidth !== undefined) {
            barWidth = result.barWidth;
        }
    }

    // If we have `rootProcessedResult` then forward it as is, otherwise we must be the root so pass the data that we just built
    const rootProcessedNodeResult = rootProcessedResult ?? {
        data,
        xKey: X_KEY,
        yKeys,
        xAxis,
        yAxis,
        domain,
        domainPadding,
        padding,
        isHorizontal,
        categories,
        labelItems,
        legendItems,
        barWidth,
        barSeriesCount,
    };

    for (const child of tnode.children) {
        const childResult = processVictoryChartTree(child, typeface, rootProcessedNodeResult);
        lodashMerge(data, childResult.data);
        yKeys.push(...childResult.yKeys);
        if (childResult.xAxis) {
            xAxis = childResult.xAxis;
        }
        if (childResult.yAxis?.length) {
            yAxis = [...(yAxis ?? []), ...childResult.yAxis];
        }
        if (childResult.domain) {
            domain = childResult.domain;
        }
        if (childResult.domainPadding) {
            domainPadding = childResult.domainPadding;
        }
        if (childResult.padding) {
            padding = childResult.padding;
        }
        if (childResult.isHorizontal) {
            isHorizontal = childResult.isHorizontal;
        }
        if (childResult.categories) {
            categories = childResult.categories;
        }
        labelItems.push(...childResult.labelItems);
        legendItems.push(...childResult.legendItems);
        if (childResult.barWidth !== undefined) {
            barWidth = childResult.barWidth;
        }
        barSeriesCount += childResult.barSeriesCount ?? 0;
    }

    const chartState: ProcessNodeResult = {
        data,
        xKey: X_KEY,
        yKeys,
        xAxis,
        yAxis,
        domain,
        domainPadding,
        padding,
        isHorizontal,
        categories,
        labelItems,
        legendItems,
        barWidth,
        barSeriesCount,
    };

    const resolvedPadding = adjustVerticalChartPadding({
        ...chartState,
        padding: adjustHorizontalChartPadding(chartState),
    });

    return {
        data,
        xKey: X_KEY,
        yKeys,
        xAxis,
        yAxis,
        domain,
        domainPadding,
        padding: resolvedPadding,
        isHorizontal,
        categories,
        labelItems,
        legendItems,
        barWidth,
        barSeriesCount,
    };
}

export default processVictoryChartTree;

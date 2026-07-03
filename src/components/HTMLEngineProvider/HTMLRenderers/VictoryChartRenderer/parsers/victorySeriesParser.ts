import {X_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import type {CartesianChartData, PartialProcessNodeResult, ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import {parseAttributeAsNumber} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseRawChartData from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseRawChartData';
import resolveCategoryIndex from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveCategoryIndex';

import type {SkTypeface} from '@shopify/react-native-skia';
import type {TNode} from 'react-native-render-html';

/**
 * Parse data points from a `<victorybar>` or `<victoryline>` node.
 * Both series types share the same data structure: an array of {x, y} points.
 */
function parseVictorySeriesNode(tnode: TNode, typeface: SkTypeface | null, rootProcessedResult: ProcessNodeResult | null): PartialProcessNodeResult {
    const isHorizontal = rootProcessedResult?.isHorizontal;
    const categories = rootProcessedResult?.categories;
    const points = parseRawChartData(tnode.attributes.data);
    const yKey = getYKey(tnode);
    const data: Record<string, CartesianChartData> = {};
    for (const point of points) {
        if (isHorizontal) {
            // Even though the X-Axis is going to hold the y values on horizontal mode, it's not the independent axis
            // thus we cannot use `point.y` as the key since two points can have the same y value.
            data[`${point.y}-${point.x}`] = {
                [X_KEY]: point.y,
                [yKey]: typeof point.x === 'number' ? point.x : resolveCategoryIndex(categories, String(point.x)),
            } as CartesianChartData;
        } else {
            data[point.x] = {
                [X_KEY]: point.x,
                [yKey]: point.y,
            } as CartesianChartData;
        }
    }
    const barWidth = tnode.tagName === 'victorybar' ? parseAttributeAsNumber(tnode.attributes.barwidth) : undefined;

    return {
        data,
        yKeys: [yKey],
        ...(barWidth !== undefined ? {barWidth} : {}),
    };
}

export default parseVictorySeriesNode;

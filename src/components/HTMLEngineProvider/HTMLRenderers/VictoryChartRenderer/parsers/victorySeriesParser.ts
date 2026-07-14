import {X_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import type {CartesianChartData, ChartPointMetadata, PartialProcessNodeResult, ProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import getChartPointMetadataKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getChartPointMetadataKey';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import {parseAttributeAsStringArray} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
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
    const pointMetadata: ProcessNodeResult['pointMetadata'] = {};
    const labels = parseAttributeAsStringArray(tnode.attributes.labels);

    for (const [index, point] of points.entries()) {
        const metadata: ChartPointMetadata = {};
        const fallbackLabel = labels?.at(index);
        if (point.label) {
            metadata.label = point.label;
        } else if (fallbackLabel) {
            metadata.label = fallbackLabel;
        }
        if (point.searchQuery) {
            metadata.searchQuery = point.searchQuery;
        }
        if (metadata.label || metadata.searchQuery) {
            pointMetadata[yKey] = {
                ...pointMetadata[yKey],
                [getChartPointMetadataKey(point.x)]: metadata,
            };
        }
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
    return {data, yKeys: [yKey], pointMetadata};
}

export default parseVictorySeriesNode;

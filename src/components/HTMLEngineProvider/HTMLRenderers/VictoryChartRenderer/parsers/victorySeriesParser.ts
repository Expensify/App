import type {TNode} from 'react-native-render-html';
import {X_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import type {CartesianChartData, PartialProcessNodeResult, RawChartData} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';

/**
 * Parse data points from a `<victorybar>` or `<victoryline>` node.
 * Both series types share the same data structure: an array of {x, y} points.
 */
function parseVictorySeriesNode(tnode: TNode): PartialProcessNodeResult {
    const points = parseAttribute<RawChartData[]>(tnode.attributes.data) ?? [];
    const yKey = getYKey(tnode);
    const data: Record<string, CartesianChartData> = {};
    for (const point of points) {
        data[point.x] = {
            [X_KEY]: point.x,
            [yKey]: point.y,
        } as CartesianChartData;
    }
    return {data, yKeys: [yKey]};
}

export default parseVictorySeriesNode;

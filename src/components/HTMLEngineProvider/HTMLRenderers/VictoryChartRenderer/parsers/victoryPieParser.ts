import type {Color} from '@shopify/react-native-skia';
import type {TNode} from 'react-native-render-html';
import VictoryTheme from '@components/Charts/VictoryTheme';
import {COLOR_KEY, LABEL_KEY, VALUE_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import type {PartialProcessNodeResult, PolarChartData, RawChartData} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';

/**
 * Parse data categories from a `<victorypie>` node.
 */
function parseVictoryPieNode(tnode: TNode): PartialProcessNodeResult {
    const categories = parseAttribute<RawChartData[]>(tnode.attributes.data) ?? [];
    const colorScale = parseAttribute<Color[]>(tnode.attributes.colorscale) ?? [];
    const data: Record<string, PolarChartData> = {};
    for (const [index, category] of categories.entries()) {
        data[category.x] = {
            [LABEL_KEY]: category.x,
            [VALUE_KEY]: category.y,
            [COLOR_KEY]: colorScale.at(index) ?? VictoryTheme.colors.default,
        };
    }
    return {data};
}

export default parseVictoryPieNode;

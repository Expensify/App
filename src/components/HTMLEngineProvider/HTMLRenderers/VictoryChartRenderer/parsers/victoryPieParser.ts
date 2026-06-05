import type {Color} from '@shopify/react-native-skia';
import type {TNode} from 'react-native-render-html';
import VictoryTheme from '@components/Charts/VictoryTheme';
import {COLOR_KEY, LABEL_KEY, VALUE_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import type {PartialProcessNodeResult, PolarChartData, RawChartData} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import isNonNullObject from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/isNonNullObject';
import parseArrayAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseArrayAttribute';

/**
 * Parse data categories from a `<victorypie>` node.
 */
function parseVictoryPieNode(tnode: TNode): PartialProcessNodeResult {
    const categories = parseArrayAttribute<RawChartData>(tnode.attributes.data).filter(isNonNullObject<RawChartData>);
    const colorScale = parseArrayAttribute<Color>(tnode.attributes.colorscale);
    const labels = parseArrayAttribute<string>(tnode.attributes.labels);
    const data: Record<string, PolarChartData> = {};
    const pieTooltipEntries: PartialProcessNodeResult['pieTooltipEntries'] = [];

    for (const [index, category] of categories.entries()) {
        data[category.x] = {
            [LABEL_KEY]: category.x,
            [VALUE_KEY]: category.y,
            [COLOR_KEY]: colorScale.at(index) ?? VictoryTheme.colors.default,
        };

        const explicitLabel = labels.at(index);
        pieTooltipEntries.push({
            label: explicitLabel ?? String(category.x),
            total: category.y,
            isLabelOnly: explicitLabel !== undefined,
        });
    }

    return {data, pieTooltipEntries};
}

export default parseVictoryPieNode;

import type {Color} from '@shopify/react-native-skia';
import type {TNode} from 'react-native-render-html';
import VictoryTheme from '@components/Charts/VictoryTheme';
import {COLOR_KEY, LABEL_KEY, VALUE_KEY} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import type {PartialProcessNodeResult, PolarChartData, RawChartData} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import isNonNullObject from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/isNonNullObject';
import parseArrayAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseArrayAttribute';
import Log from '@libs/Log';

/**
 * Parse data categories from a `<victorypie>` node.
 */
function parseVictoryPieNode(tnode: TNode): PartialProcessNodeResult {
    const rawData = tnode.attributes.data ?? '';
    const rawColorScale = tnode.attributes.colorscale ?? '';
    const parsedCategoriesRaw = parseArrayAttribute<RawChartData>(rawData);
    const categories = parsedCategoriesRaw.filter(isNonNullObject<RawChartData>);
    const colorScale = parseArrayAttribute<Color>(rawColorScale);
    const data: Record<string, PolarChartData> = {};
    const collisions: string[] = [];
    for (const [index, category] of categories.entries()) {
        if (data[category.x]) {
            collisions.push(category.x);
        }
        data[category.x] = {
            [LABEL_KEY]: category.x,
            [VALUE_KEY]: category.y,
            [COLOR_KEY]: colorScale.at(index) ?? VictoryTheme.colors.default,
        };
    }

    // Diagnostic: surface the data parse outcome so we can confirm whether on-device renders
    // see the same category set the chart author emitted. Logs raw + parsed counts, the first
    // and last categories (to spot truncation/encoding mangling), and any x-collisions that
    // would silently drop slices through Object key overwriting.
    Log.info('[VictoryChartPie debug] parseVictoryPieNode', false, {
        rawDataLength: rawData.length,
        rawDataPreview: rawData.slice(0, 200),
        parsedCategoriesCount: Array.isArray(parsedCategoriesRaw) ? parsedCategoriesRaw.length : 'not-array',
        filteredCategoriesCount: categories.length,
        firstCategory: categories.at(0),
        lastCategory: categories.at(-1),
        finalDataKeyCount: Object.keys(data).length,
        collisions,
        colorScaleLength: colorScale.length,
    });

    return {data};
}

export default parseVictoryPieNode;

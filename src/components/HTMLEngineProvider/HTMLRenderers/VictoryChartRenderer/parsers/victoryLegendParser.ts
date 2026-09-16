import normalizeChartFontWeight from '@components/Charts/utils/normalizeChartFontWeight';
import type {LegendItem, LegendItemEntry, PartialProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import {parseAttributeAsNumber} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseRawLegendData from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseRawLegendData';
import parseRawLegendStyle from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseRawLegendStyle';

import type {TNode} from 'react-native-render-html';

/**
 * Parse legend config from a `<victorylegend>` node.
 */
function parseVictoryLegendNode(tnode: TNode): PartialProcessNodeResult {
    const x = parseAttributeAsNumber(tnode.attributes.x) ?? 0;
    const y = parseAttributeAsNumber(tnode.attributes.y) ?? 0;
    const gutter = parseAttributeAsNumber(tnode.attributes.gutter) ?? undefined;
    const symbolSpacer = parseAttributeAsNumber(tnode.attributes.symbolspacer) ?? undefined;
    const style = parseRawLegendStyle(tnode.attributes.style);
    const color = style?.labels?.fill;
    const fontSize = style?.labels?.fontSize !== undefined ? Number(style.labels.fontSize) : undefined;
    const fontWeight = style?.labels?.fontWeight !== undefined ? normalizeChartFontWeight(style.labels.fontWeight) : undefined;
    const fontFamily = style?.labels?.fontFamily;
    const fontStyle = style?.labels?.fontStyle;
    const rawData = parseRawLegendData(tnode.attributes.data);
    const entries: LegendItemEntry[] = rawData.map((entry) => {
        const text = entry.name;
        const symbolColor = entry.symbol?.fill;
        const symbolSize = entry.symbol?.size !== undefined ? Number(entry.symbol.size) : undefined;
        return {text, color, fontSize, fontWeight, fontFamily, fontStyle, symbolColor, symbolSize};
    });
    const legendItem: LegendItem = {x, y, entries, gutter, symbolSpacer};
    return {legendItems: [legendItem]};
}

export default parseVictoryLegendNode;

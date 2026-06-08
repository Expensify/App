import type {TNode} from 'react-native-render-html';
import normalizeChartFontWeight from '@components/Charts/utils/normalizeChartFontWeight';
import type {LegendItem, LegendItemEntry, PartialProcessNodeResult, RawLegendData, RawLegendStyle} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import isNonNullObject from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/isNonNullObject';
import parseArrayAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseArrayAttribute';
import parseAttribute, {parseAttributeAsNumber} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';

/**
 * Parse legend config from a `<victorylegend>` node.
 */
function parseVictoryLegendNode(tnode: TNode): PartialProcessNodeResult {
    const x = parseAttributeAsNumber(tnode.attributes.x) ?? 0;
    const y = parseAttributeAsNumber(tnode.attributes.y) ?? 0;
    const gutter = parseAttributeAsNumber(tnode.attributes.gutter) ?? undefined;
    const symbolSpacer = parseAttributeAsNumber(tnode.attributes.symbolspacer) ?? undefined;
    const style = parseAttribute<RawLegendStyle>(tnode.attributes.style);
    const color = style?.labels?.fill;
    const fontSize = style?.labels?.fontSize !== undefined ? Number(style.labels.fontSize) : undefined;
    const fontWeight = style?.labels?.fontWeight !== undefined ? normalizeChartFontWeight(style.labels.fontWeight) : undefined;
    const fontFamily = style?.labels?.fontFamily;
    const fontStyle = style?.labels?.fontStyle;
    const rawData = parseArrayAttribute<RawLegendData>(tnode.attributes.data);
    const entries: LegendItemEntry[] = rawData.filter(isNonNullObject<RawLegendData>).map((entry) => {
        const text = entry.name;
        const symbolColor = entry.symbol?.fill;
        const symbolSize = entry.symbol?.size !== undefined ? Number(entry.symbol.size) : undefined;
        return {text, color, fontSize, fontWeight, fontFamily, fontStyle, symbolColor, symbolSize};
    });
    const legendItem: LegendItem = {x, y, entries, gutter, symbolSpacer};
    return {legendItems: [legendItem]};
}

export default parseVictoryLegendNode;

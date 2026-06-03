import type {TNode} from 'react-native-render-html';
import type {LabelItem, PartialProcessNodeResult, RawLabelStyle, TextAnchor} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';

/**
 * Parse label config from a `<victorylabel>` node.
 */
function parseVictoryLabelNode(tnode: TNode): PartialProcessNodeResult {
    const labelItem: LabelItem = {
        x: parseAttribute<number>(tnode.attributes.x) ?? 0,
        y: parseAttribute<number>(tnode.attributes.y) ?? 0,
        text: parseAttribute<string>(tnode.attributes.text) ?? '',
        color: {},
        fontSize: {},
        fontWeight: {},
        lineHeight: parseAttribute<number[]>(tnode.attributes.lineheight),
        textAnchor: parseAttribute<TextAnchor>(tnode.attributes.textanchor),
        verticalAnchor: parseAttribute<TextAnchor>(tnode.attributes.verticalanchor),
    };

    const style = parseAttribute(tnode.attributes.style);
    if (style) {
        const textStyles = Array.isArray(style) ? (style as RawLabelStyle[]) : [style as RawLabelStyle];
        for (const [index, textStyle] of textStyles.entries()) {
            if (textStyle.fill) {
                labelItem.color = {
                    ...labelItem.color,
                    [index]: textStyle.fill,
                };
            }
            if (textStyle.fontSize) {
                labelItem.fontSize = {
                    ...labelItem.fontSize,
                    [index]: Number(textStyle.fontSize),
                };
            }
            if (textStyle.fontWeight) {
                labelItem.fontWeight = {
                    ...labelItem.fontWeight,
                    [index]: Number(textStyle.fontWeight) === 700 ? 'bold' : 'normal',
                };
            }
        }
    }

    return {labelItems: [labelItem]};
}

export default parseVictoryLabelNode;

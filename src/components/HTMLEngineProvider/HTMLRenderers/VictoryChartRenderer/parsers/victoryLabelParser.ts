import type {TNode} from '@native-html/render';
import normalizeChartFontWeight from '@components/Charts/utils/normalizeChartFontWeight';
import type {LabelItem, PartialProcessNodeResult} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import {parseAttributeAsNumber, parseAttributeAsNumberArray, parseAttributeAsString} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseRawLabelStyle from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseRawLabelStyle';
import parseTextAnchor from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseTextAnchor';
import unescapeVictoryChartText from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/unescapeVictoryChartText';

/**
 * Parse label config from a `<victorylabel>` node.
 */
function parseVictoryLabelNode(tnode: TNode): PartialProcessNodeResult {
    const labelItem: LabelItem = {
        x: parseAttributeAsNumber(tnode.attributes.x) ?? 0,
        y: parseAttributeAsNumber(tnode.attributes.y) ?? 0,
        text: unescapeVictoryChartText(parseAttributeAsString(tnode.attributes.text) ?? ''),
        color: {},
        fontSize: {},
        fontWeight: {},
        fontFamily: {},
        fontStyle: {},
        lineHeight: parseAttributeAsNumberArray(tnode.attributes.lineheight),
        textAnchor: parseTextAnchor(tnode.attributes.textanchor),
        verticalAnchor: parseTextAnchor(tnode.attributes.verticalanchor),
    };

    const style = parseRawLabelStyle(tnode.attributes.style);
    for (const [index, textStyle] of style.entries()) {
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
                [index]: normalizeChartFontWeight(textStyle.fontWeight),
            };
        }
        if (textStyle.fontFamily) {
            labelItem.fontFamily = {
                ...labelItem.fontFamily,
                [index]: textStyle.fontFamily,
            };
        }
        if (textStyle.fontStyle) {
            labelItem.fontStyle = {
                ...labelItem.fontStyle,
                [index]: textStyle.fontStyle,
            };
        }
    }

    return {labelItems: [labelItem]};
}

export default parseVictoryLabelNode;

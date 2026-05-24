import type {TNode} from 'react-native-render-html';
import type {LabelItem, PartialProcessNodeResult, RawLabelStyle} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';

function extractLabelProps(style: RawLabelStyle | undefined): Pick<LabelItem, 'color' | 'fontSize' | 'fontWeight'> {
    return {
        color: style?.fill,
        fontSize: style?.fontSize !== undefined ? Number(style.fontSize) : undefined,
        fontWeight: Number(style?.fontWeight) === 700 ? 'bold' : undefined,
    };
}

/**
 * Parse label config from a `<victorylabel>` node.
 *
 * Supports both single-line labels (string text + object style) and multi-line
 * labels (array text + array style), expanding each line into its own LabelItem.
 * Y positions for lines after the first are offset by fontSize × lineHeight derived
 * from the optional `lineheight` attribute (number or array of per-line multipliers).
 */
function parseVictoryLabelNode(tnode: TNode): PartialProcessNodeResult {
    const x = parseAttribute<number>(tnode.attributes.x) ?? 0;
    const baseY = parseAttribute<number>(tnode.attributes.y) ?? 0;

    const rawText = parseAttribute<string | string[]>(tnode.attributes.text);
    const rawStyle = parseAttribute<RawLabelStyle | RawLabelStyle[]>(tnode.attributes.style);
    const rawLineHeight = parseAttribute<number | number[]>(tnode.attributes.lineheight);

    const texts = Array.isArray(rawText) ? rawText.map(String) : [String(rawText ?? '')];
    const styles = Array.isArray(rawStyle) ? rawStyle : [rawStyle];
    let lineHeights: number[];
    if (Array.isArray(rawLineHeight)) {
        lineHeights = rawLineHeight;
    } else if (typeof rawLineHeight === 'number') {
        lineHeights = [rawLineHeight];
    } else {
        lineHeights = [];
    }

    const labelItems: LabelItem[] = [];
    let currentY = baseY;

    for (let i = 0; i < texts.length; i++) {
        const style = styles.at(i) ?? styles.at(0);
        const props = extractLabelProps(style);
        labelItems.push({x, y: currentY, text: texts.at(i) ?? '', ...props});

        if (i < texts.length - 1) {
            const lh = lineHeights.at(i) ?? 1.2;
            const fs = props.fontSize ?? 13;
            currentY += fs * lh;
        }
    }

    return {labelItems};
}

export default parseVictoryLabelNode;

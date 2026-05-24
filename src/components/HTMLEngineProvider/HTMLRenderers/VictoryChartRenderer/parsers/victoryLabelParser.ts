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

function parseTextAnchor(raw: string | undefined): LabelItem['textAnchor'] {
    if (raw === 'middle' || raw === 'end') {
        return raw;
    }
    return 'start';
}

/**
 * Parse label config from a `<victorylabel>` node.
 */
function parseVictoryLabelNode(tnode: TNode): PartialProcessNodeResult {
    const x = parseAttribute<number>(tnode.attributes.x) ?? 0;
    const baseY = parseAttribute<number>(tnode.attributes.y) ?? 0;
    const textAnchor = parseTextAnchor(tnode.attributes.textanchor);

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
        labelItems.push({x, y: currentY, text: texts.at(i) ?? '', textAnchor, ...props});

        if (i < texts.length - 1) {
            const lh = lineHeights.at(i) ?? 1.2;
            const fs = props.fontSize ?? 13;
            currentY += fs * lh;
        }
    }

    return {labelItems};
}

export default parseVictoryLabelNode;

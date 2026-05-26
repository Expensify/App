import type {TNode} from 'react-native-render-html';
import type {LabelItem, PartialProcessNodeResult, RawLabelStyle} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import unescapeLabelText from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/unescapeLabelText';

type TextAnchor = NonNullable<LabelItem['textAnchor']>;
type VerticalAnchor = NonNullable<LabelItem['verticalAnchor']>;

function parseTextAnchor(textAnchor: string | undefined): TextAnchor | undefined {
    if (textAnchor === 'middle' || textAnchor === 'end') {
        return textAnchor;
    }
    if (textAnchor === 'start') {
        return 'start';
    }
    return undefined;
}

function parseVerticalAnchor(verticalAnchor: string | undefined): VerticalAnchor | undefined {
    if (verticalAnchor === 'middle' || verticalAnchor === 'end') {
        return verticalAnchor;
    }
    if (verticalAnchor === 'start') {
        return 'start';
    }
    return undefined;
}

function parseLabelStyle(style: RawLabelStyle | RawLabelStyle[] | undefined): Pick<LabelItem, 'color' | 'fontSize' | 'fontWeight' | 'fontFamily' | 'styles'> {
    if (Array.isArray(style)) {
        return {
            styles: style,
        };
    }

    return {
        color: style?.fill,
        fontSize: style?.fontSize !== undefined ? Number(style.fontSize) : undefined,
        fontWeight: Number(style?.fontWeight) === 700 ? 'bold' : undefined,
        fontFamily: style?.fontFamily,
    };
}

/**
 * Parse label config from a `<victorylabel>` node.
 */
function parseVictoryLabelNode(tnode: TNode): PartialProcessNodeResult {
    const x = parseAttribute<number>(tnode.attributes.x) ?? 0;
    const y = parseAttribute<number>(tnode.attributes.y) ?? 0;
    const text = unescapeLabelText(parseAttribute<string>(tnode.attributes.text) ?? '');
    const style = parseAttribute<RawLabelStyle | RawLabelStyle[]>(tnode.attributes.style);
    const lineHeight = parseAttribute<number[]>(tnode.attributes.lineheight);
    const textAnchor = parseTextAnchor(parseAttribute<string>(tnode.attributes.textanchor));
    const verticalAnchor = parseVerticalAnchor(parseAttribute<string>(tnode.attributes.verticalanchor));
    const parsedStyle = parseLabelStyle(style);
    const labelItem: LabelItem = {
        x,
        y,
        text,
        lineHeight,
        textAnchor,
        verticalAnchor,
        ...parsedStyle,
    };
    return {labelItems: [labelItem]};
}

export default parseVictoryLabelNode;

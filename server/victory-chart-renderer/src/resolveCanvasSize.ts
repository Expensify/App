import type {TNode} from 'react-native-render-html';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import type CanvasSize from './types/CanvasSize';

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 400;

function hasPositionedOverlay(tnode: TNode): boolean {
    if (tnode.tagName === 'victorylabel' || tnode.tagName === 'victorylegend') {
        const x = parseAttribute<number>(tnode.attributes.x);
        const y = parseAttribute<number>(tnode.attributes.y);

        if (typeof x === 'number' || typeof y === 'number') {
            return true;
        }
    }

    return tnode.children.some(hasPositionedOverlay);
}

function resolveCanvasSize(tnode: TNode): CanvasSize {
    const width = parseAttribute<number>(tnode.attributes.width);
    const height = parseAttribute<number>(tnode.attributes.height);

    if (width !== undefined && height !== undefined) {
        return {width, height};
    }

    if (hasPositionedOverlay(tnode)) {
        throw new Error('Charts with positioned <victorylabel> or <victorylegend> elements require explicit width and height on <victorychart>.');
    }

    return {
        width: width ?? DEFAULT_WIDTH,
        height: height ?? DEFAULT_HEIGHT,
    };
}

export default resolveCanvasSize;

import type {TNode} from 'react-native-render-html';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import type CanvasSize from './types/CanvasSize';

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 400;

function isFiniteCoordinate(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function isPositiveDimension(value: unknown): value is number {
    return isFiniteCoordinate(value) && value > 0;
}

function hasPositionedOverlay(tnode: TNode): boolean {
    if (tnode.tagName === 'victorylabel' || tnode.tagName === 'victorylegend') {
        const x = parseAttribute<number>(tnode.attributes.x);
        const y = parseAttribute<number>(tnode.attributes.y);

        if (isFiniteCoordinate(x) || isFiniteCoordinate(y)) {
            return true;
        }
    }

    return tnode.children.some(hasPositionedOverlay);
}

function resolveCanvasSize(tnode: TNode): CanvasSize {
    const rawWidth = parseAttribute<number>(tnode.attributes.width);
    const rawHeight = parseAttribute<number>(tnode.attributes.height);
    const hasWidth = rawWidth !== undefined;
    const hasHeight = rawHeight !== undefined;
    const widthIsValid = isPositiveDimension(rawWidth);
    const heightIsValid = isPositiveDimension(rawHeight);

    if (hasWidth && !widthIsValid) {
        throw new Error('<victorychart> width and height must be positive numbers');
    }

    if (hasHeight && !heightIsValid) {
        throw new Error('<victorychart> width and height must be positive numbers');
    }

    if (widthIsValid && heightIsValid) {
        return {width: rawWidth, height: rawHeight};
    }

    if (hasWidth !== hasHeight) {
        throw new Error('<victorychart> width and height must both be provided together');
    }

    if (hasPositionedOverlay(tnode)) {
        throw new Error('Charts with positioned <victorylabel> or <victorylegend> elements require explicit width and height on <victorychart>.');
    }

    return {
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
    };
}

export default resolveCanvasSize;

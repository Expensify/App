import type {CanvasSize, ContentSize} from './types';

type GetCanvasFitScale = (props: {canvasSize: CanvasSize; contentSize: ContentSize}) => {scaleX: number; scaleY: number; minScale: number; maxScale: number};

/** Clamps a value between a lower and upper bound */
function clamp(value: number, lowerBound: number, upperBound: number) {
    'worklet';

    return Math.min(Math.max(lowerBound, value), upperBound);
}

const getCanvasFitScale: GetCanvasFitScale = ({canvasSize, contentSize}) => {
    const scaleX = clamp(canvasSize.width / contentSize.width, 0, 1);
    const scaleY = clamp(canvasSize.height / contentSize.height, 0, 1);
    const minScale = Math.min(scaleX, scaleY);
    const maxScale = Math.max(scaleX, scaleY);

    return {scaleX, scaleY, minScale, maxScale};
};

export {getCanvasFitScale, clamp};

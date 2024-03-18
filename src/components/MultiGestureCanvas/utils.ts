import type {CanvasSize, ContentSize} from './types';

type GetCanvasFitScale = (props: {canvasSize: CanvasSize; contentSize: ContentSize}) => {scaleX: number; scaleY: number; minScale: number; maxScale: number};

const getCanvasFitScale: GetCanvasFitScale = ({canvasSize, contentSize}) => {
    const scaleX = canvasSize.width / contentSize.width;
    const scaleY = canvasSize.height / contentSize.height;

    const minScale = Math.min(scaleX, scaleY);
    const maxScale = Math.max(scaleX, scaleY);

    return {scaleX, scaleY, minScale, maxScale};
};

/** Clamps a value between a lower and upper bound */
function clamp(value: number, lowerBound: number, upperBound: number) {
    'worklet';

    return Math.min(Math.max(lowerBound, value), upperBound);
}

export {getCanvasFitScale, clamp};

import type {CanvasSize, ContentSize} from './types';

type ShouldResizeToFit = (canvasSize: CanvasSize, contentSize: ContentSize) => boolean;
type GetCanvasFitScale = (props: {canvasSize: CanvasSize; contentSize: ContentSize}) => {scaleX: number; scaleY: number; minScale: number; maxScale: number};

const shouldResizeToFit: ShouldResizeToFit = (canvasSize, contentSize) => {
    // If the image is smaller than canvas should no fit to canvas scale
    if (canvasSize && contentSize) {
        return canvasSize.width < contentSize.width || canvasSize.height < contentSize.height;
    }
    return false;
};

const getCanvasFitScale: GetCanvasFitScale = ({canvasSize, contentSize}) => {
    const shouldResize = shouldResizeToFit(canvasSize, contentSize);

    const scaleX = canvasSize.width / contentSize.width;
    const scaleY = canvasSize.height / contentSize.height;

    const minScale = !shouldResize ? 1 : Math.min(scaleX, scaleY);
    const maxScale = Math.max(scaleX, scaleY);

    return {scaleX, scaleY, minScale, maxScale};
};

/** Clamps a value between a lower and upper bound */
function clamp(value: number, lowerBound: number, upperBound: number) {
    'worklet';

    return Math.min(Math.max(lowerBound, value), upperBound);
}

export {getCanvasFitScale, clamp};

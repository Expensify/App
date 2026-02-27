import type {Dimensions} from '@src/types/utils/Layout';

type GetCanvasFitScale = (props: {canvasSize: Dimensions; contentSize: Dimensions}) => {scaleX: number; scaleY: number; minScale: number; maxScale: number};

/** Clamps a value between a lower and upper bound */
function clamp(value: number, lowerBound: number, upperBound: number) {
    'worklet';

    return Math.min(Math.max(lowerBound, value), upperBound);
}

// Small buffer to prevent hairline spacing issues caused by floating-point precision errors
// When scaling images, rounding can create sub-pixel gaps that appear as thin lines
const SCALE_BUFFER = 1.001;

const getCanvasFitScale: GetCanvasFitScale = ({canvasSize, contentSize}) => {
    const scaleX = clamp(canvasSize.width / contentSize.width, 0, 1);
    const scaleY = clamp(canvasSize.height / contentSize.height, 0, 1);
    // Apply small buffer to ensure scaled image always fills container completely,
    // eliminating hairline spaces that can appear due to rounding precision
    const minScale = Math.min(scaleX, scaleY) * SCALE_BUFFER;
    const maxScale = Math.max(scaleX, scaleY);

    return {scaleX, scaleY, minScale, maxScale};
};

export {getCanvasFitScale, clamp};

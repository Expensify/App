import Onyx from 'react-native-onyx';
import canvasSize from 'canvas-size';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * Calculate the max area of canvas on this specific platform and save it in onyx
 */
function retrieveMaxCanvasArea() {
    canvasSize.maxArea({
        onSuccess: (width, height) => {
            Onyx.merge(ONYXKEYS.MAX_CANVAS_AREA, width * height);
        },
    });
}

/**
 * Calculate the max height of canvas on this specific platform and save it in onyx
 */
function retrieveMaxCanvasHeight() {
    canvasSize.maxHeight({
        onSuccess: (width, height) => {
            Onyx.merge(ONYXKEYS.MAX_CANVAS_HEIGHT, height);
        },
    });
}

/**
 * Calculate the max width of canvas on this specific platform and save it in onyx
 */
function retrieveMaxCanvasWidth() {
    canvasSize.maxWidth({
        onSuccess: (width) => {
            Onyx.merge(ONYXKEYS.MAX_CANVAS_WIDTH, width);
        },
    });
}

export {
    // eslint-disable-next-line import/prefer-default-export
    retrieveMaxCanvasArea,
    retrieveMaxCanvasHeight,
    retrieveMaxCanvasWidth,
};

import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import canvasSize from 'canvas-size';

/**
 * Calculate the max area of canvas on this specific platform and save it in onyx
 */
function retrieveMaxCanvasArea() {
    canvasSize.maxArea({
        onSuccess: (width, height)  => {
            const maxCanvasArea = width * height;
            Onyx.merge(ONYXKEYS.MAX_CANVAS_AREA, maxCanvasArea);
        }
    });
}

/**
 * Calculate the max height of canvas on this specific platform and save it in onyx
 */
function retrieveMaxCanvasHeight() {
        canvasSize.maxHeight({
            onSuccess: (width, height)  => {
                const maxCanvasHeight =  height;
                Onyx.merge(ONYXKEYS.MAX_CANVAS_HEIGHT, maxCanvasHeight);
            }
        });
}

/**
 * Calculate the max width of canvas on this specific platform and save it in onyx
 */
function retrieveMaxCanvasWidth() {
    canvasSize.maxWidth({
            onSuccess: (width)  => {
            const maxCanvasWidth = width;
            Onyx.merge(ONYXKEYS.MAX_CANVAS_Width, maxCanvasWidth);
        }
    });
}

export {
    // eslint-disable-next-line import/prefer-default-export
    retrieveMaxCanvasArea,
    retrieveMaxCanvasHeight,
    retrieveMaxCanvasWidth,
};

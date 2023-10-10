import Onyx from 'react-native-onyx';
import canvasSize from 'canvas-size';
import ONYXKEYS from '../../ONYXKEYS';
import * as Browser from '../Browser';

/**
 * Calculate the max area of canvas on this specific platform and save it in onyx. The maximum value was limited because on mobile devices there is a crash related to the size of the area
 */
function retrieveMaxCanvasArea() {
    canvasSize
        .maxArea({
            max: Browser.isMobile() ? 8192 : null,
            usePromise: true,
            useWorker: false,
        })
        .then(() => ({
            onSuccess: (width, height) => {
                Onyx.merge(ONYXKEYS.MAX_CANVAS_AREA, width * height);
            },
        }));
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

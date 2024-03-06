import canvasSize from 'canvas-size';
import Onyx from 'react-native-onyx';
import * as Browser from '@libs/Browser';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Calculate the max area of canvas on this specific platform and save it in onyx
 */
function retrieveMaxCanvasArea() {
    // We're limiting the maximum value on mobile web to prevent a crash related to rendering large canvas elements.
    // More information at: https://github.com/jhildenbiddle/canvas-size/issues/13
    canvasSize
        .maxArea({
            max: Browser.isMobile() ? 8192 : undefined,
            usePromise: true,
            useWorker: false,
        })
        .then(({width, height}) => {
            Onyx.merge(ONYXKEYS.MAX_CANVAS_AREA, width * height);
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

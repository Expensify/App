import PropTypes from 'prop-types';
import refPropTypes from '@components/refPropTypes';

const defaultZoomRange = {
    min: 1,
    max: 20,
};

const zoomRangePropTypes = {
    /** Range of zoom that can be applied to the content by pinching or double tapping. */
    zoomRange: PropTypes.shape({
        min: PropTypes.number,
        max: PropTypes.number,
    }),
};

const zoomRangeDefaultProps = {
    zoomRange: {
        min: defaultZoomRange.min,
        max: defaultZoomRange.max,
    },
};

const multiGestureCanvasPropTypes = {
    ...zoomRangePropTypes,

    /**
     *  The width and height of the canvas.
     *  This is needed in order to properly scale the content in the canvas
    /** The width and height of the canvas.
     * This is needed in order to properly scale the content in the canvas
     */
    canvasSize: PropTypes.shape({
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
    }).isRequired,

    /**
     *  The width and height of the content.
     *  This is needed in order to properly scale the content in the canvas
     */
    contentSize: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }),

    /**
     *  The scale factors (scaleX, scaleY) that are used to scale the content (width/height) to the canvas size.
     *  `scaledWidth` and `scaledHeight` reflect the actual size of the content after scaling.
    /**
     * Wheter the canvas is currently active (in the screen) or not.
     * Disables certain gestures and functionality
     */
    isActive: PropTypes.bool,

    /** Handles scale changed event */
    onScaleChanged: PropTypes.func,

    /**
     *  A shared value of type boolean, that indicates disabled the transformation gestures (pinch, pan, double tap)
     */
    shouldDisableTransformationGestures: PropTypes.shape({value: PropTypes.bool}),

    /** If there is a pager wrapping the canvas, we need to disable the pan gesture in case the pager is swiping */
    pagerRef: refPropTypes, // TODO: For TS migration: Exclude<GestureRef, number>

    /** Content that should be transformed inside the canvas (images, pdf, ...) */
    children: PropTypes.node.isRequired,
};

const multiGestureCanvasDefaultProps = {
    isActive: true,
    areTransformationsEnabled: true,
    onScaleChanged: () => undefined,
    contentSize: undefined,
    contentScaling: undefined,
    zoomRange: defaultZoomRange,
};

export {defaultZoomRange, zoomRangePropTypes, zoomRangeDefaultProps, multiGestureCanvasPropTypes, multiGestureCanvasDefaultProps};

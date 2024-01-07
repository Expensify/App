import PropTypes from 'prop-types';

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
     *  Wheter the canvas is currently active (in the screen) or not.
     *  Disables certain gestures and functionality
     */
    isActive: PropTypes.bool,

    /** Handles scale changed event */
    onScaleChanged: PropTypes.func,

    /**
     *  The width and height of the canvas.
     *  This is needed in order to properly scale the content in the canvas
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

    /** Content that should be transformed inside the canvas (images, pdf, ...) */
    children: PropTypes.node.isRequired,
};

const multiGestureCanvasDefaultProps = {
    isActive: true,
    onScaleChanged: () => undefined,
    contentSize: undefined,
    contentScaling: undefined,
    zoomRange: undefined,
};

export {defaultZoomRange, zoomRangePropTypes, zoomRangeDefaultProps, multiGestureCanvasPropTypes, multiGestureCanvasDefaultProps};

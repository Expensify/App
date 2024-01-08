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

    /**
     *  The scale factors (scaleX, scaleY) that are used to scale the content (width/height) to the canvas size.
     *  `scaledWidth` and `scaledHeight` reflect the actual size of the content after scaling.
     */
    contentScaling: PropTypes.shape({
        scaleX: PropTypes.number,
        scaleY: PropTypes.number,
        scaledWidth: PropTypes.number,
        scaledHeight: PropTypes.number,
    }),

    /**
     *  A shared value of type boolean, that indicates disabled the transformation gestures (pinch, pan, double tap)
     */
    shouldDisableTransformationGestures: PropTypes.shape({value: PropTypes.bool}),

    /**
     *  A ref to an external gesture handler, like a PagerView from `react-native-pager-view`
     *  Used to disable the pan, pinch and double tap gesture when the user is swiping between pages
     */
    externalGestureRef: refPropTypes,

    /** Content that should be transformed inside the canvas (images, pdf, ...) */
    children: PropTypes.node.isRequired,
};

const multiGestureCanvasDefaultProps = {
    isActive: true,
    areTransformationsEnabled: true,
    onScaleChanged: () => undefined,
    contentSize: undefined,
    contentScaling: undefined,
    zoomRange: undefined,
};

export {defaultZoomRange, zoomRangePropTypes, zoomRangeDefaultProps, multiGestureCanvasPropTypes, multiGestureCanvasDefaultProps};

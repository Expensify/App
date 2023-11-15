import PropTypes from 'prop-types';
import * as Constants from './Constants';

const zoomRangePropTypes = {
    zoomRange: PropTypes.shape({
        min: PropTypes.number,
        max: PropTypes.number,
    }),
};

const zoomRangeDefaultProps = {
    zoomRange: {
        min: Constants.DEFAULT_MIN_ZOOM_SCALE,
        max: Constants.DEFAULT_MAX_ZOOM_SCALE,
    },
};

const multiGestureCanvasPropTypes = {
    ...zoomRangePropTypes,

    isActive: PropTypes.bool,

    onScaleChanged: PropTypes.func,

    canvasSize: PropTypes.shape({
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
    }).isRequired,

    contentSize: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
    }),

    contentScaling: PropTypes.shape({
        scaleX: PropTypes.number,
        scaleY: PropTypes.number,
        scaledWidth: PropTypes.number,
        scaledHeight: PropTypes.number,
    }),

    children: PropTypes.node.isRequired,
};

const multiGestureCanvasDefaultProps = {
    isActive: true,
    onScaleChanged: () => undefined,
    contentSize: undefined,
    contentScaling: undefined,
    zoomRange: undefined,
};

export {zoomRangePropTypes, zoomRangeDefaultProps, multiGestureCanvasPropTypes, multiGestureCanvasDefaultProps};

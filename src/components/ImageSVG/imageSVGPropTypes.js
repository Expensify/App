import PropTypes from 'prop-types';

const propTypes = {
    /** The asset to render. */
    src: PropTypes.oneOfType([PropTypes.func, PropTypes.number]).isRequired,

    /** The width of the image. */
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** The height of the image. */
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** The fill color for the image. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'. */
    fill: PropTypes.string,

    /** Is image hovered */
    hovered: PropTypes.bool,

    /** Is image pressed */
    pressed: PropTypes.bool,

    /** Determines how the image should be resized to fit its container */
    contentFit: PropTypes.string,

    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** The pointer-events attribute allows us to define whether or when an element may be the target of a mouse event. */
    pointerEvents: PropTypes.string,

    /** The preserveAspectRatio attribute indicates how an element with a viewBox providing a given aspect ratio must fit into a viewport with a different aspect ratio. */
    preserveAspectRatio: PropTypes.string,
};

const defaultProps = {
    fill: undefined,
    width: '100%',
    height: '100%',
    hovered: false,
    pressed: false,
    contentFit: 'cover',
    style: [],
    pointerEvents: undefined,
    preserveAspectRatio: undefined,
};

export {propTypes, defaultProps};

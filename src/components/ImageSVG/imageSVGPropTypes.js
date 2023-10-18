import PropTypes from 'prop-types';

const propTypes = {
    /** The asset to render. */
    src: PropTypes.oneOfType([PropTypes.func, PropTypes.number]).isRequired,

    /** The width of the icon. */
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** The height of the icon. */
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    /** The fill color for the image. Can be hex, rgb, rgba, or valid react-native named color such as 'red' or 'blue'. */
    fill: PropTypes.string,

    /** Is icon hovered */
    hovered: PropTypes.bool,

    /** Is icon pressed */
    pressed: PropTypes.bool,

    /** Determines how the image should be resized to fit its container */
    contentFit: PropTypes.string,

    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
};

const defaultProps = {
    fill: undefined,
    width: '100%',
    height: '100%',
    hovered: false,
    pressed: false,
    contentFit: 'cover',
    style: [],
};

export {propTypes, defaultProps};

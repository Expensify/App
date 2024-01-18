import PropTypes from 'prop-types';

const propTypes = {
    /** pointerEvents property to the SVG element */
    pointerEvents: PropTypes.string.isRequired,

    /** The width of the image. */
    width: PropTypes.number.isRequired,

    /** Called when the image load either succeeds or fails. */
    onLoadEnd: PropTypes.func,
};

export default propTypes;

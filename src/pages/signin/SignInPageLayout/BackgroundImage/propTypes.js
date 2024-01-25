import PropTypes from 'prop-types';

const propTypes = {
    /** pointerEvents property to the SVG element */
    pointerEvents: PropTypes.string.isRequired,

    /** The width of the image. */
    width: PropTypes.number.isRequired,

    /** Tranistion duration in milisecond */
    transitionDuration: PropTypes.number,
};

export default propTypes;

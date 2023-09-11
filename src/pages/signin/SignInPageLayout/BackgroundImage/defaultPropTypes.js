import PropTypes from 'prop-types';

const defaultPropTypes = {
    /** pointerEvents property to the SVG element */ 
    pointerEvents: PropTypes.string.isRequired,

    /** The width of the image. */
    width: PropTypes.number.isRequired,
};

export default defaultPropTypes;
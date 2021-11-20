import PropTypes from 'prop-types';

const propTypes = {
    /** The asset to render. */
    src: PropTypes.string.isRequired,

    /** The width of the image. */
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,

    /** The height of the image. */
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default propTypes;

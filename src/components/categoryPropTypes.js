import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** Name of a category */
    name: PropTypes.string.isRequired,

    /** Flag that determine is a category active */
    enabled: PropTypes.bool.isRequired,
});

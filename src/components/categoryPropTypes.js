import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** Name of a category */
    name: PropTypes.string.isRequired,

    /** Flag that determines if a category is active and able to be selected */
    enabled: PropTypes.bool.isRequired,
});

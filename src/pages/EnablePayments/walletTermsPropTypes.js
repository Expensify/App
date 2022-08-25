import PropTypes from 'prop-types';

/**  */
export default PropTypes.shape({
    /** Any error message to show */
    errors: PropTypes.objectOf(PropTypes.string),
});

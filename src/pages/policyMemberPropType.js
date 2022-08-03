import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** Role of the user in the policy */
    role: PropTypes.string,

    /**
     * Errors from api calls on the specific user
     * {<timestamp>: 'error message', <timestamp2>: 'error message 2'}
     */
    errors: PropTypes.objectOf(PropTypes.string),

    /** Is this action pending? */
    pendingAction: PropTypes.string,
});

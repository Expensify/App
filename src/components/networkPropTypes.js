import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** Is the network currently offline or not */
    isOffline: PropTypes.bool,

    /** Whether we should fail all network requests */
    shouldFailAllRequests: PropTypes.bool,
});

import PropTypes from 'prop-types';

export default {
    /** Token used to initialize the Onfido SDK */
    sdkToken: PropTypes.string.isRequired,

    /** Called when the user intentionally exits the flow without completing it */
    onUserExit: PropTypes.func.isRequired,

    /** Called when the user is totally done with Onfido */
    onSuccess: PropTypes.func.isRequired,
};

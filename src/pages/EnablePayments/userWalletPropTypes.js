import PropTypes from 'prop-types';

export default {
    /** User's wallet information */
    userWallet: PropTypes.shape({
        /** What step in the activation flow are we on? */
        currentStep: PropTypes.string,

        /** Status of wallet - e.g. SILVER or GOLD */
        tierName: PropTypes.string,

        /** Error code returned by the server */
        errorCode: PropTypes.string,
    }),
};

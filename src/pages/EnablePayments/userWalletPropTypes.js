import PropTypes from 'prop-types';

export default {
    /** User's wallet information */
    userWallet: PropTypes.shape({
        /** What step in the activation flow are we on? */
        currentStep: PropTypes.string,

        /** Status of wallet - e.g. SILVER or GOLD */
        tierName: PropTypes.string,

        /** If we should show the FailedKYC view after the user submitted their info with a non fixable error */
        shouldShowFailedKYC: PropTypes.bool,
    }),
};

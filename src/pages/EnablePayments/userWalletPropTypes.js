import PropTypes from 'prop-types';

/** User's wallet information */
export default PropTypes.shape({
    /** The user's available wallet balance */
    availableBalance: PropTypes.number,

    /** The user's current wallet balance */
    currentBalance: PropTypes.number,

    /** What step in the activation flow are we on? */
    currentStep: PropTypes.string,

    /** Error code returned by the server */
    errorCode: PropTypes.string,

    /** If we should show the FailedKYC view after the user submitted their info with a non fixable error */
    shouldShowFailedKYC: PropTypes.bool,

    /** Status of wallet - e.g. SILVER or GOLD */
    tierName: PropTypes.string,

    /** Whether we should show the ActivateStep success view after the user finished the KYC flow */
    shouldShowWalletActivationSuccess: PropTypes.bool,
});

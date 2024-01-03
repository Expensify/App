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

    /** Whether the kyc is pending and is yet to be confirmed */
    isPendingOnfidoResult: PropTypes.bool,

    /** The wallet's programID, used to show the correct terms. */
    walletProgramID: PropTypes.string,

    /** Whether the user has failed Onfido completely */
    hasFailedOnfido: PropTypes.bool,
});

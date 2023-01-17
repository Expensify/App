import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** Unique identifier returned from openOnfidoFlow then re-sent to ActivateWallet with Onfido response data */
    applicantID: PropTypes.string,

    /** Token used to initialize the Onfido SDK token */
    sdkToken: PropTypes.string,

    /** Loading state to provide feedback when we are waiting for a request to finish */
    loading: PropTypes.bool,

    /** Error message to inform the user of any problem that might occur */
    error: PropTypes.string,

    /** A list of Onfido errors that the user can fix in order to attempt the Onfido flow again */
    fixableErrors: PropTypes.arrayOf(PropTypes.string),

    /** Whether the user has accepted the privacy policy of Onfido or not */
    hasAcceptedPrivacyPolicy: PropTypes.bool,
});

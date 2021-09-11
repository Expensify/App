import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** Whether we are loading the data via the API */
    loading: PropTypes.bool,

    /** A date that indicates the user has been throttled */
    throttledDate: PropTypes.string,

    /** Additional data for the account in setup */
    achData: PropTypes.shape({

        /** Step of the setup flow that we are on. Determines which view is presented. */
        currentStep: PropTypes.string,
    }),

    /** Disable validation button if max attempts exceeded */
    maxAttemptsReached: PropTypes.bool,

    /** The existing owners for if the bank account is already owned */
    existingOwners: PropTypes.arrayOf(PropTypes.string),

    /** Alert message to display above submit button */
    alertMessage: PropTypes.string,
});

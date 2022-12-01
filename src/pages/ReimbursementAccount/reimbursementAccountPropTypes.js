import PropTypes from 'prop-types';
import BankAccount from '../../libs/models/BankAccount';

const reimbursementAccountPropTypes = PropTypes.shape({
    /** Whether we are loading the data via the API */
    isLoading: PropTypes.bool,

    /** A date that indicates the user has been throttled */
    throttledDate: PropTypes.string,

    /** Additional data for the account in setup */
    achData: PropTypes.shape({

        /** Step of the setup flow that we are on. Determines which view is presented. */
        currentStep: PropTypes.string,

        /** Bank account state */
        state: PropTypes.string,

        /** Bank account ID of the VBA that we are validating is required */
        bankAccountID: PropTypes.number,

    }),

    /** Disable validation button if max attempts exceeded */
    maxAttemptsReached: PropTypes.bool,

    /** Alert message to display above submit button */
    error: PropTypes.string,

    /** Which field needs attention? */
    errorFields: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.bool, PropTypes.array])),

    /** Any additional error message to show */
    errors: PropTypes.objectOf(PropTypes.string),
});

const reimbursementAccountDefaultProps = {
    achData: {
        state: BankAccount.STATE.SETUP,
    },
    isLoading: false,
    errorFields: {},
    errors: {},
    maxAttemptsReached: false,
    shouldHideContinueSetupButton: false,
    shouldShowResetModal: false,
};

export {reimbursementAccountPropTypes, reimbursementAccountDefaultProps};

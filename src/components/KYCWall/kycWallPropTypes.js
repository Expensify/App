import PropTypes from 'prop-types';
import userWalletPropTypes from '../../pages/EnablePayments/userWalletPropTypes';

const propTypes = {
    /** Route for the Add Bank Account screen for a given navigation stack */
    addBankAccountRoute: PropTypes.string.isRequired,

    /** Route for the Add Debit Card screen for a given navigation stack */
    addDebitCardRoute: PropTypes.string.isRequired,

    /** Route for the KYC enable payments screen for a given navigation stack */
    enablePaymentsRoute: PropTypes.string.isRequired,

    /** Where to place the popover */
    popoverPlacement: PropTypes.string,

    /** Listen for window resize event on web and desktop */
    shouldListenForResize: PropTypes.bool,

    /** Wrapped components should be disabled, and not in spinner/loading state */
    isDisabled: PropTypes.bool,

    /** The user's wallet */
    userWallet: PropTypes.objectOf(userWalletPropTypes),
};

const defaultProps = {
    userWallet: {},
    popoverPlacement: 'top',
    shouldListenForResize: false,
    isDisabled: false,
};

export {propTypes, defaultProps};

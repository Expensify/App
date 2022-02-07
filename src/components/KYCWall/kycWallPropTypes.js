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
    listenResize: PropTypes.bool,

    ...userWalletPropTypes,
};

const defaultProps = {
    // eslint-disable-next-line react/default-props-match-prop-types
    userWallet: {},
    popoverPlacement: 'top',
    listenResize: false,
};

export {propTypes, defaultProps};

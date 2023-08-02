import PropTypes from 'prop-types';
import userWalletPropTypes from '../../pages/EnablePayments/userWalletPropTypes';
import bankAccountPropTypes from '../bankAccountPropTypes';
import cardPropTypes from '../cardPropTypes';
import iouReportPropTypes from '../../pages/iouReportPropTypes';
import reimbursementAccountPropTypes from '../../pages/ReimbursementAccount/ReimbursementAccountDraftPropTypes';

const propTypes = {
    /** Route for the Add Bank Account screen for a given navigation stack */
    addBankAccountRoute: PropTypes.string.isRequired,

    /** Route for the Add Debit Card screen for a given navigation stack */
    addDebitCardRoute: PropTypes.string,

    /** Route for the KYC enable payments screen for a given navigation stack */
    enablePaymentsRoute: PropTypes.string.isRequired,

    /** Where to place the popover */
    popoverPlacement: PropTypes.string,

    /** Listen for window resize event on web and desktop */
    shouldListenForResize: PropTypes.bool,

    /** Wrapped components should be disabled, and not in spinner/loading state */
    isDisabled: PropTypes.bool,

    /** The user's wallet */
    userWallet: userWalletPropTypes,

    /** When the button is opened via an IOU, ID for the chatReport that the IOU is linked to */
    chatReportID: PropTypes.string,

    /** List of cards */
    cardList: PropTypes.objectOf(cardPropTypes),

    /** List of cards */
    fundList: PropTypes.objectOf(cardPropTypes),

    /** List of bank accounts */
    bankAccountList: PropTypes.objectOf(bankAccountPropTypes),

    /** The chat report this report is linked to */
    chatReport: iouReportPropTypes,

    /** The IOU/Expense report we are paying */
    iouReport: iouReportPropTypes,

    /** The reimbursement account linked to the Workspace */
    reimbursementAccount: reimbursementAccountPropTypes,
};

const defaultProps = {
    userWallet: {},
    popoverPlacement: 'top',
    shouldListenForResize: false,
    isDisabled: false,
    chatReportID: '',
    bankAccountList: {},
    cardList: null,
    fundList: null,
    chatReport: null,
    reimbursementAccount: {},
    addDebitCardRoute: '',
    iouReport: {},
};

export {propTypes, defaultProps};

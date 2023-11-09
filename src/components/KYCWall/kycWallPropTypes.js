import PropTypes from 'prop-types';
import _ from 'underscore';
import bankAccountPropTypes from '@components/bankAccountPropTypes';
import cardPropTypes from '@components/cardPropTypes';
import userWalletPropTypes from '@pages/EnablePayments/userWalletPropTypes';
import walletTermsPropTypes from '@pages/EnablePayments/walletTermsPropTypes';
import iouReportPropTypes from '@pages/iouReportPropTypes';
import reimbursementAccountPropTypes from '@pages/ReimbursementAccount/ReimbursementAccountDraftPropTypes';
import CONST from '@src/CONST';

const propTypes = {
    /** Route for the Add Bank Account screen for a given navigation stack */
    addBankAccountRoute: PropTypes.string.isRequired,

    /** Route for the Add Debit Card screen for a given navigation stack */
    addDebitCardRoute: PropTypes.string,

    /** Route for the KYC enable payments screen for a given navigation stack */
    enablePaymentsRoute: PropTypes.string.isRequired,

    /** Listen for window resize event on web and desktop */
    shouldListenForResize: PropTypes.bool,

    /** Wrapped components should be disabled, and not in spinner/loading state */
    isDisabled: PropTypes.bool,

    /** The user's wallet */
    userWallet: userWalletPropTypes,

    /** Information related to the last step of the wallet activation flow */
    walletTerms: walletTermsPropTypes,

    /** The source that triggered the KYC wall */
    source: PropTypes.oneOf(_.values(CONST.KYC_WALL_SOURCE)).isRequired,

    /** When the button is opened via an IOU, ID for the chatReport that the IOU is linked to */
    chatReportID: PropTypes.string,

    /** List of user's cards */
    fundList: PropTypes.objectOf(cardPropTypes),

    /** List of bank accounts */
    bankAccountList: PropTypes.objectOf(bankAccountPropTypes),

    /** The chat report this report is linked to */
    chatReport: iouReportPropTypes,

    /** The IOU/Expense report we are paying */
    iouReport: iouReportPropTypes,

    /** The reimbursement account linked to the Workspace */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** Where the popover should be positioned relative to the anchor points. */
    anchorAlignment: PropTypes.shape({
        horizontal: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL)),
        vertical: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL)),
    }),

    /** Whether the option to add a debit card should be included */
    shouldIncludeDebitCard: PropTypes.bool,

    /** Callback for when a payment method has been selected */
    onSelectPaymentMethod: PropTypes.func,
};

const defaultProps = {
    userWallet: {},
    walletTerms: {},
    shouldListenForResize: false,
    isDisabled: false,
    chatReportID: '',
    bankAccountList: {},
    fundList: null,
    chatReport: null,
    reimbursementAccount: {},
    addDebitCardRoute: '',
    iouReport: {},
    anchorAlignment: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    },
    shouldIncludeDebitCard: true,
    onSelectPaymentMethod: () => {},
};

export {propTypes, defaultProps};

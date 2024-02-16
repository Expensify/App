import PropTypes from 'prop-types';
import bankAccountPropTypes from '@components/bankAccountPropTypes';
import cardPropTypes from '@components/cardPropTypes';
import networkPropTypes from '@components/networkPropTypes';
import userWalletPropTypes from '@pages/EnablePayments/userWalletPropTypes';
import walletTermsPropTypes from '@pages/EnablePayments/walletTermsPropTypes';
import walletTransferPropTypes from '@pages/settings/Wallet/walletTransferPropTypes';

const propTypes = {
    /** Wallet balance transfer props */
    walletTransfer: walletTransferPropTypes,

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Are we loading payment methods? */
    isLoadingPaymentMethods: PropTypes.bool,

    /** Listen for window resize event on web and desktop. */
    shouldListenForResize: PropTypes.bool,

    /** The user's wallet account */
    userWallet: userWalletPropTypes,

    /** Information about the network */
    network: networkPropTypes.isRequired,

    /** List of bank accounts */
    bankAccountList: PropTypes.objectOf(bankAccountPropTypes),

    /** List of user's cards */
    fundList: PropTypes.objectOf(cardPropTypes),

    /** Information about the user accepting the terms for payments */
    walletTerms: walletTermsPropTypes,
};

const defaultProps = {
    walletTransfer: {
        shouldShowSuccess: false,
    },
    betas: [],
    isLoadingPaymentMethods: true,
    shouldListenForResize: false,
    userWallet: {},
    bankAccountList: {},
    cardList: {},
    fundList: null,
    walletTerms: {},
};

export {propTypes, defaultProps};

import PropTypes from 'prop-types';
import walletTransferPropTypes from '../walletTransferPropTypes';
import {withLocalizePropTypes} from '../../../../components/withLocalize';
import {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';
import networkPropTypes from '../../../../components/networkPropTypes';
import bankAccountPropTypes from '../../../../components/bankAccountPropTypes';
import cardPropTypes from '../../../../components/cardPropTypes';

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
    userWallet: PropTypes.shape({
        /** The user's current wallet balance */
        currentBalance: PropTypes.number,
    }),

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withLocalizePropTypes,

    ...windowDimensionsPropTypes,

    /** List of bank accounts */
    bankAccountList: PropTypes.objectOf(bankAccountPropTypes),

    /** List of cards */
    cardList: PropTypes.objectOf(cardPropTypes),
};

const defaultProps = {
    walletTransfer: {
        shouldShowConfirmModal: false,
    },
    betas: [],
    isLoadingPaymentMethods: true,
    shouldListenForResize: false,
    userWallet: {},
    bankAccountList: {},
    cardList: {},
};

export {propTypes, defaultProps};

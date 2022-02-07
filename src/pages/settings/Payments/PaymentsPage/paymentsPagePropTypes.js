import PropTypes from 'prop-types';
import walletTransferPropTypes from '../walletTransferPropTypes';
import {withLocalizePropTypes} from '../../../../components/withLocalize';
import {windowDimensionsPropTypes} from '../../../../components/withWindowDimensions';

const propTypes = {
    /** Wallet balance transfer props */
    walletTransfer: walletTransferPropTypes,

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Are we loading payment methods? */
    isLoadingPaymentMethods: PropTypes.bool,

    /** Listen for window resize event on web and desktop. */
    listenResize: PropTypes.bool,

    ...withLocalizePropTypes,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    walletTransfer: {
        shouldShowConfirmModal: false,
    },
    betas: [],
    isLoadingPaymentMethods: true,
    listenResize: false,
};

export {propTypes, defaultProps};

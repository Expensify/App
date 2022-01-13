import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import PaymentMethodList from './PaymentMethodList';
import ROUTES from '../../../ROUTES';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView/index';
import Text from '../../../components/Text';
import * as PaymentMethods from '../../../libs/actions/PaymentMethods';
import getClickedElementLocation from '../../../libs/getClickedElementLocation';
import CurrentWalletBalance from '../../../components/CurrentWalletBalance';
import ONYXKEYS from '../../../ONYXKEYS';
import Permissions from '../../../libs/Permissions';
import AddPaymentMethodMenu from '../../../components/AddPaymentMethodMenu';
import CONST from '../../../CONST';
import * as Expensicons from '../../../components/Icon/Expensicons';
import MenuItem from '../../../components/MenuItem';
import walletTransferPropTypes from './walletTransferPropTypes';
import ConfirmModal from '../../../components/ConfirmModal';
import KYCWall from '../../../components/KYCWall';

const propTypes = {
    /** Wallet balance transfer props */
    walletTransfer: walletTransferPropTypes,

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Are we loading payment methods? */
    isLoadingPaymentMethods: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    walletTransfer: {
        shouldShowConfirmModal: false,
    },
    betas: [],
    isLoadingPaymentMethods: true,
};

class PaymentsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            shouldShowAddPaymentMenu: false,
            anchorPositionTop: 0,
            anchorPositionLeft: 0,
        };

        this.paymentMethodPressed = this.paymentMethodPressed.bind(this);
        this.addPaymentMethodTypePressed = this.addPaymentMethodTypePressed.bind(this);
        this.hideAddPaymentMenu = this.hideAddPaymentMenu.bind(this);
        this.navigateToTransferBalancePage = this.navigateToTransferBalancePage.bind(this);
    }

    componentDidMount() {
        PaymentMethods.getPaymentMethods();
    }

    /**
     * Display the delete/default menu, or the add payment method menu
     *
     * @param {Object} nativeEvent
     * @param {String} account
     */
    paymentMethodPressed(nativeEvent, account) {
        if (account) {
            if (account === CONST.PAYMENT_METHODS.PAYPAL) {
                Navigation.navigate(ROUTES.SETTINGS_ADD_PAYPAL_ME);
            }
        } else {
            const position = getClickedElementLocation(nativeEvent);
            this.setState({
                shouldShowAddPaymentMenu: true,
                anchorPositionTop: position.bottom,

                // We want the position to be 20px to the right of the left border
                anchorPositionLeft: position.left + 20,
            });
        }
    }

    /**
     * Navigate to the appropriate payment type addition screen
     *
     * @param {String} paymentType
     */
    addPaymentMethodTypePressed(paymentType) {
        this.hideAddPaymentMenu();

        if (paymentType === CONST.PAYMENT_METHODS.PAYPAL) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_PAYPAL_ME);
            return;
        }

        if (paymentType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_DEBIT_CARD);
            return;
        }

        if (paymentType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT);
            return;
        }

        throw new Error('Invalid payment method type selected');
    }

    /**
     * Hide the add payment modal
     */
    hideAddPaymentMenu() {
        this.setState({shouldShowAddPaymentMenu: false});
    }

    navigateToTransferBalancePage() {
        Navigation.navigate(ROUTES.SETTINGS_PAYMENTS_TRANSFER_BALANCE);
    }

    render() {
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('common.payments')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <View style={styles.flex1}>
                        {Permissions.canUseWallet(this.props.betas) && (
                            <>
                                <View style={[styles.mv5]}>
                                    <CurrentWalletBalance />
                                </View>
                                <KYCWall
                                    onSuccessfulKYC={this.navigateToTransferBalancePage}
                                    enablePaymentsRoute={ROUTES.SETTINGS_ENABLE_PAYMENTS}
                                    addBankAccountRoute={ROUTES.SETTINGS_ADD_BANK_ACCOUNT}
                                    addDebitCardRoute={ROUTES.SETTINGS_ADD_DEBIT_CARD}
                                    popoverPlacement="bottom"
                                >
                                    {triggerKYCFlow => (
                                        <MenuItem
                                            title={this.props.translate('common.transferBalance')}
                                            icon={Expensicons.Transfer}
                                            onPress={triggerKYCFlow}
                                            shouldShowRightIcon
                                        />
                                    )}
                                </KYCWall>
                            </>
                        )}
                        <Text
                            style={[styles.ph5, styles.formLabel]}
                        >
                            {this.props.translate('paymentsPage.paymentMethodsTitle')}
                        </Text>
                        <PaymentMethodList
                            onPress={this.paymentMethodPressed}
                            style={[styles.flex4]}
                            isLoadingPayments={this.props.isLoadingPaymentMethods}
                            isAddPaymentMenuActive={this.state.shouldShowAddPaymentMenu}
                        />
                    </View>
                    <AddPaymentMethodMenu
                        isVisible={this.state.shouldShowAddPaymentMenu}
                        onClose={this.hideAddPaymentMenu}
                        anchorPosition={{
                            top: this.state.anchorPositionTop,
                            left: this.state.anchorPositionLeft,
                        }}
                        onItemSelected={method => this.addPaymentMethodTypePressed(method)}
                    />
                    <ConfirmModal
                        title={this.props.translate('paymentsPage.allSet')}
                        onConfirm={PaymentMethods.dismissWalletConfirmModal}
                        isVisible={this.props.walletTransfer.shouldShowConfirmModal}
                        prompt={this.props.translate('paymentsPage.transferConfirmText', {
                            amount: this.props.numberFormat(
                                this.props.walletTransfer.transferAmount / 100,
                                {style: 'currency', currency: 'USD'},
                            ),
                        })}
                        confirmText={this.props.translate('paymentsPage.gotIt')}
                        shouldShowCancelButton={false}
                    />
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

PaymentsPage.propTypes = propTypes;
PaymentsPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        walletTransfer: {
            key: ONYXKEYS.WALLET_TRANSFER,
        },
        isLoadingPaymentMethods: {
            key: ONYXKEYS.IS_LOADING_PAYMENT_METHODS,
            initWithStoredValues: false,
        },
    }),
)(PaymentsPage);

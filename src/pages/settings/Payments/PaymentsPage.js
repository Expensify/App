import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {ScrollView, View} from 'react-native';
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
import ExpensifyText from '../../../components/ExpensifyText';
import * as PaymentMethods from '../../../libs/actions/PaymentMethods';
import CurrentWalletBalance from '../../../components/CurrentWalletBalance';
import ONYXKEYS from '../../../ONYXKEYS';
import * as paymentPropTypes from './paymentPropTypes';
import Permissions from '../../../libs/Permissions';
import AddPaymentMethodMenu from '../../../components/AddPaymentMethodMenu';
import CONST from '../../../CONST';
import * as Expensicons from '../../../components/Icon/Expensicons';
import MenuItem from '../../../components/MenuItem';
import ConfirmModal from '../../../components/ConfirmModal';

const propTypes = {
    walletTransfer: paymentPropTypes.walletTransferPropTypes,

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Are we loading payment methods? */
    isLoadingPaymentMethods: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    walletTransfer: {
        completed: false,
    },
    betas: [],
    isLoadingPaymentMethods: true,
};

class PaymentsPage extends React.Component {
    constructor(props) {
        super(props);

        this.paymentMethodPressed = this.paymentMethodPressed.bind(this);
        this.transferBalance = this.transferBalance.bind(this);
    }

    componentDidMount() {
        PaymentMethods.getPaymentMethods();
    }

    /**
     * Navigate to respective payment page when existing payment method is pressed
     *
     * @param {String} account
     */
    paymentMethodPressed(account) {
        if (account !== CONST.PAYMENT_METHODS.PAYPAL) {
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_ADD_PAYPAL_ME);
    }

    /**
     * Transfer wallet balance
     */
    transferBalance() {
        Navigation.navigate(ROUTES.SETTINGS_TRANSFER_BALANCE);
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
                    <ScrollView style={styles.flex1}>
                        {Permissions.canUseWallet(this.props.betas) && (
                            <>
                                <View style={[styles.mv5]}>
                                    <CurrentWalletBalance />
                                </View>
                                <MenuItem
                                    title={this.props.translate('common.transferBalance')}
                                    icon={Expensicons.Transfer}
                                    onPress={this.transferBalance}
                                    shouldShowRightIcon
                                />
                            </>
                        )}
                        <ExpensifyText
                            style={[styles.ph5, styles.mt5, styles.formLabel]}
                        >
                            {this.props.translate('paymentsPage.paymentMethodsTitle')}
                        </ExpensifyText>
                        <PaymentMethodList
                            onPress={this.paymentMethodPressed}
                            isLoadingPayments={this.props.isLoadingPaymentMethods}
                        />
                        <AddPaymentMethodMenu />
                    </ScrollView>
                    <ConfirmModal
                        title={this.props.translate('paymentsPage.allSet')}
                        onConfirm={PaymentMethods.cancelWalletTransfer}
                        isVisible={this.props.walletTransfer.completed}
                        prompt={this.props.translate('paymentsPage.transferConfirmText', {
                            amount: this.props.numberFormat(
                                this.props.walletTransfer.transferAmount,
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
        walletTransfer: {
            key: ONYXKEYS.WALLET_TRANSFER,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
        isLoadingPaymentMethods: {
            key: ONYXKEYS.IS_LOADING_PAYMENT_METHODS,
            initWithStoredValues: false,
        },
    }),
)(PaymentsPage);

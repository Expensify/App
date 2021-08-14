import React from 'react';
import {View} from 'react-native';
import Onyx, {withOnyx} from 'react-native-onyx';
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
import {getPaymentMethods} from '../../../libs/actions/PaymentMethods';
import Popover from '../../../components/Popover';
import {PayPal, Transfer} from '../../../components/Icon/Expensicons';
import MenuItem from '../../../components/MenuItem';
import getClickedElementLocation from '../../../libs/getClickedElementLocation';
import CurrentWalletBalance from '../../../components/CurrentWalletBalance';
import ConfirmModal from '../../../components/ConfirmModal';
import ONYXKEYS from '../../../ONYXKEYS';
import {walletTransferPropTypes} from './paymentPropTypes';

const PAYPAL = 'payPalMe';

const propTypes = {
    walletTransfer: walletTransferPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    walletTransfer: {
        completed: false,
    },
};

class PaymentsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            shouldShowAddPaymentMenu: false,
            anchorPositionTop: 0,
            anchorPositionLeft: 0,
            isLoadingPaymentMethods: true,
        };

        this.paymentMethodPressed = this.paymentMethodPressed.bind(this);
        this.addPaymentMethodTypePressed = this.addPaymentMethodTypePressed.bind(this);
        this.hideAddPaymentMenu = this.hideAddPaymentMenu.bind(this);
        this.transferBalance = this.transferBalance.bind(this);
    }

    componentDidMount() {
        getPaymentMethods().then(() => {
            this.setState({isLoadingPaymentMethods: false});
        });
    }

    /**
     * Display the delete/default menu, or the add payment method menu
     *
     * @param {Object} nativeEvent
     * @param {String} account
     */
    paymentMethodPressed(nativeEvent, account) {
        if (account) {
            if (account === PAYPAL) {
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

        if (paymentType === PAYPAL) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_PAYPAL_ME);
        }
    }

    /**
     * Hide the add payment modal
     */
    hideAddPaymentMenu() {
        this.setState({shouldShowAddPaymentMenu: false});
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
                    <View style={[styles.mv5]}>
                        <CurrentWalletBalance />
                    </View>
                    <MenuItem
                        title={this.props.translate('common.transferBalance')}
                        icon={Transfer}
                        onPress={this.transferBalance}
                        shouldShowRightIcon
                    />
                    <View style={[styles.flex1, styles.pt4]}>
                        <Text
                            style={[styles.ph5, styles.formLabel]}
                        >
                            {this.props.translate('paymentsPage.paymentMethodsTitle')}
                        </Text>
                        <PaymentMethodList
                            onPress={this.paymentMethodPressed}
                            style={[styles.flex4]}
                            isLoadingPayments={this.state.isLoadingPaymentMethods}
                        />
                    </View>
                    <Popover
                        isVisible={this.state.shouldShowAddPaymentMenu}
                        onClose={this.hideAddPaymentMenu}
                        anchorPosition={{
                            top: this.state.anchorPositionTop,
                            left: this.state.anchorPositionLeft,
                        }}
                    >
                        <MenuItem
                            title="PayPal.me"
                            icon={PayPal}
                            onPress={() => this.addPaymentMethodTypePressed(PAYPAL)}
                        />
                    </Popover>
                    <ConfirmModal
                        title={this.props.translate('paymentsPage.allSet')}
                        onConfirm={() => Onyx.set(ONYXKEYS.WALLET_TRANSFER, null)}
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
PaymentsPage.displayName = 'PaymentsPage';

export default compose(
    withLocalize,
    withOnyx({
        walletTransfer: {
            key: ONYXKEYS.WALLET_TRANSFER,
        },
    }),
)(PaymentsPage);

import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ROUTES from '../../../ROUTES';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView/index';
import PaymentMethodList from './PaymentMethodList';
import ONYXKEYS from '../../../ONYXKEYS';
import compose from '../../../libs/compose';
import * as paymentPropTypes from './paymentPropTypes';
import * as PaymentMethods from '../../../libs/actions/PaymentMethods';
import CONST from '../../../CONST';

const propTypes = {
    walletTransfer: paymentPropTypes.walletTransferPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    walletTransfer: {},
};

class ChooseTransferAccountPage extends React.Component {
    constructor(props) {
        super(props);
        this.paymentMethodSelected = this.paymentMethodSelected.bind(this);
    }

    /**
     * Navigate to the appropriate payment method type addition screen
     * @param {String} paymentMethodType
     */
    navigateToAddPaymentMethod(paymentMethodType) {
        if (paymentMethodType === CONST.PAYMENT_METHODS.PAYPAL) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_PAYPAL_ME);
        }

        if (paymentMethodType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_DEBIT_CARD);
        }

        if (paymentMethodType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT);
        }
    }

    /**
     * Go back to TransferPage with the selected bank account
     *
     * @param {Object} nativeEvent
     * @param {String} accountID id of the selected account.
     */
    paymentMethodSelected(nativeEvent, accountID) {
        // If accountID is undefined it means that addPaymentMethod button is pressed.
        if (!accountID) {
            this.navigateToAddPaymentMethod(this.props.walletTransfer.filterPaymentMethodType);
            return;
        }
        PaymentMethods.updateWalletTransferData({selectedAccountID: accountID});
        Navigation.navigate(ROUTES.SETTINGS_TRANSFER_BALANCE);
    }

    render() {
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('chooseTransferAccountPage.chooseAccount')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.goBack()}
                        onCloseButtonPress={() => Navigation.dismissModal()}
                    />
                    <View style={[styles.flex1, styles.pv5]}>
                        <PaymentMethodList
                            onPress={this.paymentMethodSelected}
                            enableSelection
                            filterType={this.props.walletTransfer.filterPaymentMethodType}
                            selectedAccountID={this.props.walletTransfer.selectedAccountID}
                        />
                    </View>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

ChooseTransferAccountPage.propTypes = propTypes;
ChooseTransferAccountPage.defaultProps = defaultProps;
ChooseTransferAccountPage.displayName = 'ChooseTransferAccountPage';

export default compose(
    withLocalize,
    withOnyx({
        walletTransfer: {
            key: ONYXKEYS.WALLET_TRANSFER,
        },
    }),
)(ChooseTransferAccountPage);
